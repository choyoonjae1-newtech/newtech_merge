from typing import List, Optional
from datetime import datetime
import uuid


class LoanApplication:
    def __init__(self, applicant_id: str, company_name: str, ceo_name: str,
                 property_address: str, loan_amount: int, loan_duration: int = 12):
        self.id = str(uuid.uuid4())[:8]
        self.applicant_id = applicant_id
        self.company_name = company_name
        self.ceo_name = ceo_name
        self.property_address = property_address
        self.loan_amount = loan_amount
        self.loan_duration = loan_duration  # 대출기간 (개월)
        self.status = "접수완료"  # 접수완료, 심사중, 승인, 반려
        self.created_at = datetime.now().strftime("%Y-%m-%d %H:%M")
        self.memo = ""

    def to_dict(self):
        return {
            "id": self.id,
            "applicant_id": self.applicant_id,
            "company_name": self.company_name,
            "ceo_name": self.ceo_name,
            "property_address": self.property_address,
            "loan_amount": self.loan_amount,
            "loan_duration": self.loan_duration,
            "status": self.status,
            "created_at": self.created_at,
            "memo": self.memo
        }


class ApplicationStore:
    """대출 신청 저장소 (In-Memory)"""

    def __init__(self):
        self.applications: List[LoanApplication] = []
        self._init_dummy_applications()

    def _init_dummy_applications(self):
        """더미 신청 데이터"""
        samples = [
            ("customer", "파란캐피탈대부", "김대출", "서울시 강남구 대치동 은마아파트 3동 502호", 850000000, 24),
            ("customer", "파란캐피탈대부", "김대출", "서울시 서초구 반포동 아크로리버파크 1동 1801호", 1200000000, 36),
            ("customer", "파란캐피탈대부", "김대출", "서울시 송파구 잠실동 잠실엘스 208동 1503호", 920000000, 12),
        ]
        for applicant_id, company, ceo, address, amount, duration in samples:
            app = LoanApplication(applicant_id, company, ceo, address, amount, duration)
            self.applications.append(app)

    def submit(self, applicant_id: str, company_name: str, ceo_name: str,
               property_address: str, loan_amount: int, loan_duration: int = 12) -> LoanApplication:
        """신청 제출"""
        app = LoanApplication(applicant_id, company_name, ceo_name,
                              property_address, loan_amount, loan_duration)
        self.applications.append(app)
        return app

    def get_all(self) -> List[dict]:
        """전체 신청 목록 (심사자용)"""
        return [app.to_dict() for app in sorted(
            self.applications, key=lambda x: x.created_at, reverse=True
        )]

    def get_by_applicant(self, applicant_id: str) -> List[dict]:
        """특정 신청자의 신청 목록"""
        return [app.to_dict() for app in sorted(
            [a for a in self.applications if a.applicant_id == applicant_id],
            key=lambda x: x.created_at, reverse=True
        )]

    def get_by_id(self, app_id: str) -> Optional[LoanApplication]:
        """신청 ID로 조회"""
        for app in self.applications:
            if app.id == app_id:
                return app
        return None

    def update_status(self, app_id: str, status: str, memo: str = "") -> Optional[dict]:
        """신청 상태 변경 (심사자용)"""
        app = self.get_by_id(app_id)
        if app:
            app.status = status
            if memo:
                app.memo = memo
            return app.to_dict()
        return None


application_store = ApplicationStore()
