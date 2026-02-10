from typing import List, Optional
from datetime import datetime, timedelta
import random


class CompletedLoan:
    def __init__(self, loan_id: str, auditor_name: str, company_name: str,
                 ceo_name: str, property_address: str, loan_amount: int,
                 execution_date: str, execution_price: int,
                 current_price: int):
        self.loan_id = loan_id
        self.auditor_name = auditor_name
        self.company_name = company_name
        self.ceo_name = ceo_name
        self.property_address = property_address
        self.loan_amount = loan_amount
        self.execution_date = execution_date
        self.execution_price = execution_price
        self.current_price = current_price

        # LTV 계산
        self.execution_ltv = round(loan_amount / execution_price * 100, 1)
        self.current_ltv = round(loan_amount / current_price * 100, 1)
        self.ltv_change = round(self.current_ltv - self.execution_ltv, 1)

        # 신호등 판정: 하락(-) = 안전, 소폭상승(0~3) = 주의, 상승(3+) = 위험
        if self.ltv_change <= 0:
            self.signal = "green"
            self.signal_label = "안전"
        elif self.ltv_change <= 3.0:
            self.signal = "yellow"
            self.signal_label = "주의"
        else:
            self.signal = "red"
            self.signal_label = "위험"

    def to_dict(self):
        return {
            "loan_id": self.loan_id,
            "auditor_name": self.auditor_name,
            "company_name": self.company_name,
            "ceo_name": self.ceo_name,
            "property_address": self.property_address,
            "loan_amount": self.loan_amount,
            "execution_date": self.execution_date,
            "execution_price": self.execution_price,
            "current_price": self.current_price,
            "execution_ltv": self.execution_ltv,
            "current_ltv": self.current_ltv,
            "ltv_change": self.ltv_change,
            "signal": self.signal,
            "signal_label": self.signal_label
        }


class MonitoringStore:
    """사후모니터링 저장소 (In-Memory)"""

    def __init__(self):
        self.loans: List[CompletedLoan] = []
        self._init_dummy_loans()

    def _init_dummy_loans(self):
        """더미 완료 대출 데이터 생성"""
        samples = [
            {
                "loan_id": "LN-2024-001",
                "auditor_name": "박심사",
                "company_name": "파란캐피탈대부",
                "ceo_name": "김대출",
                "property_address": "서울시 강남구 대치동 은마아파트 3동 502호",
                "loan_amount": 680000000,
                "execution_date": "2024-06-15",
                "execution_price": 1050000000,
                "current_price": 1120000000,
            },
            {
                "loan_id": "LN-2024-002",
                "auditor_name": "박심사",
                "company_name": "하늘캐피탈대부",
                "ceo_name": "이하늘",
                "property_address": "서울시 서초구 반포동 아크로리버파크 1동 1801호",
                "loan_amount": 1100000000,
                "execution_date": "2024-07-22",
                "execution_price": 1800000000,
                "current_price": 1750000000,
            },
            {
                "loan_id": "LN-2024-003",
                "auditor_name": "최검토",
                "company_name": "파란캐피탈대부",
                "ceo_name": "김대출",
                "property_address": "서울시 송파구 잠실동 잠실엘스 208동 1503호",
                "loan_amount": 750000000,
                "execution_date": "2024-08-10",
                "execution_price": 1200000000,
                "current_price": 1180000000,
            },
            {
                "loan_id": "LN-2024-004",
                "auditor_name": "박심사",
                "company_name": "바다저축은행대부",
                "ceo_name": "박바다",
                "property_address": "서울시 강남구 역삼동 타워팰리스 2차 3동 4501호",
                "loan_amount": 900000000,
                "execution_date": "2024-09-05",
                "execution_price": 1350000000,
                "current_price": 1400000000,
            },
            {
                "loan_id": "LN-2024-005",
                "auditor_name": "최검토",
                "company_name": "노을캐피탈대부",
                "ceo_name": "정노을",
                "property_address": "서울시 용산구 한남동 한남더힐 109동 301호",
                "loan_amount": 1500000000,
                "execution_date": "2024-10-18",
                "execution_price": 2200000000,
                "current_price": 2350000000,
            },
            {
                "loan_id": "LN-2024-006",
                "auditor_name": "박심사",
                "company_name": "해돋이금융대부",
                "ceo_name": "최해돋",
                "property_address": "서울시 마포구 아현동 마포래미안푸르지오 105동 2201호",
                "loan_amount": 520000000,
                "execution_date": "2024-11-02",
                "execution_price": 780000000,
                "current_price": 720000000,
            },
            {
                "loan_id": "LN-2025-001",
                "auditor_name": "최검토",
                "company_name": "별빛캐피탈",
                "ceo_name": "한별빛",
                "property_address": "서울시 성동구 금호동 옥수리버뷰 201동 1502호",
                "loan_amount": 600000000,
                "execution_date": "2025-01-08",
                "execution_price": 950000000,
                "current_price": 940000000,
            },
            {
                "loan_id": "LN-2025-002",
                "auditor_name": "박심사",
                "company_name": "파란캐피탈대부",
                "ceo_name": "김대출",
                "property_address": "서울시 양천구 목동 목동신시가지 7단지 702동 801호",
                "loan_amount": 480000000,
                "execution_date": "2025-01-25",
                "execution_price": 820000000,
                "current_price": 810000000,
            },
        ]

        for s in samples:
            loan = CompletedLoan(**s)
            self.loans.append(loan)

    def get_all(self) -> List[dict]:
        """전체 모니터링 목록"""
        return [loan.to_dict() for loan in sorted(
            self.loans, key=lambda x: x.execution_date, reverse=True
        )]

    def get_by_id(self, loan_id: str) -> Optional[dict]:
        """대출 ID로 조회"""
        for loan in self.loans:
            if loan.loan_id == loan_id:
                return loan.to_dict()
        return None

    def add_loan(self, auditor_name: str, company_name: str, ceo_name: str,
                 property_address: str, loan_amount: int, execution_price: int) -> dict:
        """승인된 대출을 모니터링에 등록"""
        today = datetime.now()
        year = today.strftime("%Y")
        seq = len(self.loans) + 1
        loan_id = f"LN-{year}-{seq:03d}"

        loan = CompletedLoan(
            loan_id=loan_id,
            auditor_name=auditor_name,
            company_name=company_name,
            ceo_name=ceo_name,
            property_address=property_address,
            loan_amount=loan_amount,
            execution_date=today.strftime("%Y-%m-%d"),
            execution_price=execution_price,
            current_price=execution_price
        )
        self.loans.append(loan)
        return loan.to_dict()

    def get_summary(self) -> dict:
        """요약 통계"""
        total = len(self.loans)
        green = sum(1 for l in self.loans if l.signal == "green")
        yellow = sum(1 for l in self.loans if l.signal == "yellow")
        red = sum(1 for l in self.loans if l.signal == "red")
        total_amount = sum(l.loan_amount for l in self.loans)
        avg_current_ltv = round(sum(l.current_ltv for l in self.loans) / total, 1) if total > 0 else 0

        return {
            "total_count": total,
            "green_count": green,
            "yellow_count": yellow,
            "red_count": red,
            "total_amount": total_amount,
            "avg_current_ltv": avg_current_ltv
        }


monitoring_store = MonitoringStore()
