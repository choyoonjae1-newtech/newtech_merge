from typing import Dict, Optional
from datetime import datetime


class User:
    def __init__(self, user_id: str, password: str, role: str,
                 company_name: str = "", ceo_name: str = "",
                 business_number: str = "", phone: str = ""):
        self.user_id = user_id
        self.password = password
        self.role = role  # "customer" or "auditor"
        self.company_name = company_name
        self.ceo_name = ceo_name
        self.business_number = business_number
        self.phone = phone
        self.created_at = datetime.now().isoformat()


class AuthStore:
    """인증 저장소 (In-Memory)"""

    def __init__(self):
        self.users: Dict[str, User] = {}
        self._init_default_users()

    def _init_default_users(self):
        """기본 계정 생성"""
        self.users["customer"] = User(
            user_id="customer",
            password="1",
            role="customer",
            company_name="파란캐피탈대부",
            ceo_name="김대출",
            business_number="123-45-67890",
            phone="02-1234-5678"
        )
        self.users["audit"] = User(
            user_id="audit",
            password="1",
            role="auditor",
            company_name="JB우리캐피탈",
            ceo_name="박심사",
        )

    def login(self, user_id: str, password: str) -> Optional[User]:
        """로그인"""
        user = self.users.get(user_id)
        if user and user.password == password:
            return user
        return None

    def register(self, user_id: str, password: str, company_name: str,
                 ceo_name: str, business_number: str, phone: str) -> Optional[User]:
        """회원가입 (대부업체 전용)"""
        if user_id in self.users:
            return None

        user = User(
            user_id=user_id,
            password=password,
            role="customer",
            company_name=company_name,
            ceo_name=ceo_name,
            business_number=business_number,
            phone=phone
        )
        self.users[user_id] = user
        return user

    def get_user(self, user_id: str) -> Optional[User]:
        return self.users.get(user_id)


auth_store = AuthStore()
