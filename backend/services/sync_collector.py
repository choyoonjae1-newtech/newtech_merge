"""
Celery 없이 직접 수집을 실행하는 동기 수집 서비스.

개발/데모 환경에서 Celery 워커 없이도 수집이 동작하도록 합니다.
FastAPI의 BackgroundTasks로 실행됩니다.
"""
import asyncio
import logging
from datetime import datetime
from typing import List

from sqlalchemy.orm import Session

from core.database import SessionLocal
from models import (
    Complex, Area, CrawlRun, CrawlTask,
    KBPrice, Transaction, Listing, ListingStatus,
    RunStatus, TaskStatus,
)
from connectors import KBPriceConnector, KBTransactionConnector, KBListingConnector

logger = logging.getLogger(__name__)


def _ensure_areas(db: Session, complex_obj: Complex) -> List[Area]:
    """단지에 면적 정보가 없으면 KB API에서 자동 조회"""
    if complex_obj.areas:
        return complex_obj.areas

    if not complex_obj.kb_complex_id:
        logger.warning(f"Complex {complex_obj.id}: no kb_complex_id, skip area fetch")
        return []

    try:
        from connectors.kb_endpoints import COMPLEX_TYPE_INFO
        from services.complex_discovery import _DiscoveryConnector

        connector = _DiscoveryConnector(name="area_fetch", rate_limit_per_minute=30)
        loop = asyncio.new_event_loop()
        try:
            data = loop.run_until_complete(
                connector._fetch_via_http(
                    COMPLEX_TYPE_INFO, {"단지기본일련번호": complex_obj.kb_complex_id}
                )
            )
        finally:
            loop.close()

        body = data.get("dataBody", {}).get("data", [])
        area_list = body if isinstance(body, list) else []

        created = []
        for a in area_list:
            exclusive = a.get("전용면적", 0)
            try:
                exclusive = float(str(exclusive).replace(",", ""))
            except (ValueError, TypeError):
                continue
            if exclusive <= 0:
                continue

            supply = None
            try:
                supply = float(str(a.get("공급면적", "")).replace(",", "")) or None
            except (ValueError, TypeError):
                pass

            pyeong = None
            try:
                pyeong = float(str(a.get("평", "")).replace(",", "")) or None
            except (ValueError, TypeError):
                pass

            area_code = str(a.get("면적일련번호", "")) or None
            area = Area(
                complex_id=complex_obj.id,
                exclusive_m2=exclusive,
                supply_m2=supply,
                pyeong=pyeong,
                kb_area_code=area_code,
            )
            db.add(area)
            created.append(area)

        if created:
            db.flush()
            logger.info(f"Complex {complex_obj.id}: registered {len(created)} areas")
        return created

    except Exception as e:
        logger.warning(f"Complex {complex_obj.id}: area fetch failed: {e}")
        return []


def _collect_price(db: Session, run_id: int, complex_id: int, area_id: int) -> dict:
    """단일 면적 KB 시세 수집"""
    task_key = f"kb_price_{complex_id}_{area_id}"
    task_record = CrawlTask(
        run_id=run_id, task_key=task_key,
        status=TaskStatus.RUNNING, started_at=datetime.utcnow(),
    )
    db.add(task_record)
    db.commit()

    try:
        connector = KBPriceConnector(db_session=db)
        result = connector.collect(complex_id=complex_id, area_id=area_id)

        items_saved = 0
        for item in result["items"]:
            existing = db.query(KBPrice).filter(
                KBPrice.complex_id == complex_id,
                KBPrice.area_id == area_id,
                KBPrice.as_of_date == item["as_of_date"],
            ).first()

            if existing:
                existing.general_price = item["general_price"]
                existing.high_avg_price = item["high_avg_price"]
                existing.low_avg_price = item["low_avg_price"]
                existing.fetched_at = datetime.utcnow()
            else:
                db.add(KBPrice(
                    complex_id=complex_id, area_id=area_id,
                    as_of_date=item["as_of_date"],
                    general_price=item["general_price"],
                    high_avg_price=item["high_avg_price"],
                    low_avg_price=item["low_avg_price"],
                    source=item["source"],
                    fetched_at=datetime.utcnow(),
                ))
            items_saved += 1

        # 최근 실거래가 추출
        raw_data = result.get("raw")
        if raw_data:
            area_obj = db.get(Area, area_id)
            exclusive_m2 = area_obj.exclusive_m2 if area_obj else None
            tx_data = connector.parse_recent_transaction(raw_data)
            if tx_data and exclusive_m2:
                existing_tx = db.query(Transaction).filter(
                    Transaction.complex_id == complex_id,
                    Transaction.contract_date == tx_data["contract_date"],
                    Transaction.price == tx_data["price"],
                    Transaction.exclusive_m2 == exclusive_m2,
                ).first()
                if not existing_tx:
                    db.add(Transaction(
                        complex_id=complex_id,
                        contract_date=tx_data["contract_date"],
                        price=tx_data["price"],
                        exclusive_m2=exclusive_m2,
                        floor=tx_data.get("floor"),
                        source="kb", fetched_at=datetime.utcnow(),
                    ))
                    items_saved += 1

        db.commit()
        task_record.status = TaskStatus.SUCCESS
        task_record.items_collected = len(result["items"])
        task_record.items_saved = items_saved
        task_record.finished_at = datetime.utcnow()
        db.commit()
        logger.info(f"[sync] {task_key}: {items_saved} items saved")
        return {"status": "success", "items": items_saved}

    except Exception as e:
        logger.exception(f"[sync] {task_key} failed: {e}")
        try:
            db.rollback()
        except Exception:
            pass
        task_record.status = TaskStatus.FAILED
        task_record.error_type = type(e).__name__
        task_record.error_message = str(e)[:500]
        task_record.finished_at = datetime.utcnow()
        try:
            db.commit()
        except Exception:
            pass
        return {"status": "failed", "error": str(e)}


def _collect_listing(db: Session, run_id: int, complex_id: int) -> dict:
    """단일 단지 KB 매물 수집"""
    task_key = f"kb_listing_{complex_id}"
    task_record = CrawlTask(
        run_id=run_id, task_key=task_key,
        status=TaskStatus.RUNNING, started_at=datetime.utcnow(),
    )
    db.add(task_record)
    db.commit()

    try:
        connector = KBListingConnector(db_session=db)
        result = connector.collect(complex_id=complex_id)

        saved_count = 0
        seen_ids = set()
        for item in result["items"]:
            lid = item["source_listing_id"]
            seen_ids.add(lid)
            existing = db.query(Listing).filter(Listing.source_listing_id == lid).first()
            if existing:
                existing.ask_price = item["ask_price"]
                existing.status = ListingStatus.ACTIVE
                existing.fetched_at = datetime.utcnow()
                existing.last_seen_at = datetime.utcnow()
            else:
                db.add(Listing(
                    complex_id=complex_id,
                    source_listing_id=lid,
                    ask_price=item["ask_price"],
                    exclusive_m2=item.get("exclusive_m2"),
                    floor=item.get("floor"),
                    status=ListingStatus.ACTIVE,
                    posted_at=item.get("posted_at"),
                    source="kb", fetched_at=datetime.utcnow(),
                    last_seen_at=datetime.utcnow(),
                ))
            saved_count += 1

        # 이번에 안 보인 기존 ACTIVE → REMOVED
        if seen_ids:
            stale = db.query(Listing).filter(
                Listing.complex_id == complex_id,
                Listing.status == ListingStatus.ACTIVE,
                Listing.source_listing_id.notin_(seen_ids),
            ).all()
            for s in stale:
                s.status = ListingStatus.REMOVED
                s.status_updated_at = datetime.utcnow()

        db.commit()
        task_record.status = TaskStatus.SUCCESS
        task_record.items_collected = len(result["items"])
        task_record.items_saved = saved_count
        task_record.finished_at = datetime.utcnow()
        db.commit()
        logger.info(f"[sync] {task_key}: {saved_count} listings saved")
        return {"status": "success", "items": saved_count}

    except Exception as e:
        logger.exception(f"[sync] {task_key} failed: {e}")
        try:
            db.rollback()
        except Exception:
            pass
        task_record.status = TaskStatus.FAILED
        task_record.error_type = type(e).__name__
        task_record.error_message = str(e)[:500]
        task_record.finished_at = datetime.utcnow()
        try:
            db.commit()
        except Exception:
            pass
        return {"status": "failed", "error": str(e)}


def collect_complex_sync(run_id: int, complex_ids: List[int]):
    """
    Celery 없이 동기적으로 수집을 실행.
    별도 스레드(BackgroundTasks)에서 호출됨.
    """
    db = SessionLocal()
    try:
        run = db.query(CrawlRun).filter(CrawlRun.id == run_id).first()
        if not run:
            logger.error(f"Run {run_id} not found")
            return
        run.status = RunStatus.RUNNING
        run.started_at = datetime.utcnow()
        db.commit()

        complexes = db.query(Complex).filter(Complex.id.in_(complex_ids)).all()
        if not complexes:
            run.status = RunStatus.FAILED
            run.finished_at = datetime.utcnow()
            db.commit()
            return

        # 총 태스크 수 계산
        total_tasks = 0
        complex_areas = []
        for c in complexes:
            areas = c.areas or _ensure_areas(db, c)
            complex_areas.append((c, areas))
            total_tasks += len(areas) + 1  # 시세(면적별) + 매물(1)

        run.total_tasks = total_tasks
        db.commit()

        success_count = 0
        failed_count = 0

        for c, areas in complex_areas:
            # 시세 수집 (면적별)
            for area in areas:
                result = _collect_price(db, run_id, c.id, area.id)
                if result["status"] == "success":
                    success_count += 1
                else:
                    failed_count += 1

            # 매물 수집
            result = _collect_listing(db, run_id, c.id)
            if result["status"] == "success":
                success_count += 1
            else:
                failed_count += 1

        # 완료 처리
        run.success_count = success_count
        run.failed_count = failed_count
        run.finished_at = datetime.utcnow()
        if failed_count == 0:
            run.status = RunStatus.SUCCESS
        elif success_count == 0:
            run.status = RunStatus.FAILED
        else:
            run.status = RunStatus.PARTIAL
        db.commit()

        logger.info(
            f"[sync] Run {run_id} complete: {run.status.value} "
            f"(success={success_count}, failed={failed_count})"
        )
    except Exception as e:
        logger.exception(f"[sync] Run {run_id} crashed: {e}")
        try:
            run = db.query(CrawlRun).filter(CrawlRun.id == run_id).first()
            if run:
                run.status = RunStatus.FAILED
                run.finished_at = datetime.utcnow()
                run.error_summary = str(e)[:500]
                db.commit()
        except Exception:
            pass
    finally:
        db.close()
