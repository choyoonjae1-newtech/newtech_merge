from typing import List, Set
from datetime import datetime


class SearchHistory:
    """검색 이력 저장소 (In-Memory)"""

    def __init__(self):
        # Set을 사용하여 중복 제거
        self.companies: Set[str] = set()
        self.addresses: Set[str] = set()

        # 초기 더미 데이터 (사내 이력 시뮬레이션)
        self._init_dummy_history()

    def _init_dummy_history(self):
        """초기 더미 이력 데이터"""
        # 대부업체명 샘플
        self.companies = {
            "파란캐피탈대부",
            "파란금융대부",
            "파란저축은행대부",
            "하늘캐피탈대부",
            "하늘금융저축은행",
            "바다캐피탈",
            "바다저축은행대부",
            "산캐피탈대부",
            "산금융대부",
            "들판캐피탈",
            "들판저축은행",
            "노을캐피탈대부",
            "해돋이금융대부",
            "별빛캐피탈",
            "무지개저축은행대부",
            "JB캐피탈대부",
            "KB금융대부",
            "신한캐피탈대부"
        }

        # 주소 샘플
        self.addresses = {
            "서울시 강남구 대치동 은마아파트",
            "서울시 강남구 대치동 은마아파트 2동 1203호",
            "서울시 강남구 역삼동 타워팰리스",
            "서울시 서초구 반포동 아크로리버파크",
            "서울시 서초구 잠원동 신반포자이",
            "서울시 송파구 잠실동 잠실엘스",
            "서울시 송파구 잠실동 리센츠",
            "서울시 강남구 청담동 청담자이",
            "서울시 강남구 논현동 힐스테이트",
            "서울시 서초구 서초동 래미안",
            "서울시 양천구 목동 목동신시가지",
            "서울시 마포구 아현동 마포래미안",
            "서울시 용산구 한남동 한남더힐",
            "서울시 성동구 금호동 옥수리버뷰",
            "서울시 강서구 등촌동 등촌주공아파트",
            "서울시 노원구 상계동 상계주공아파트",
            "서울시 은평구 응암동 은평뉴타운"
        }

    def add_company(self, company_name: str):
        """대부업체명 추가"""
        if company_name and company_name.strip():
            self.companies.add(company_name.strip())

    def add_address(self, address: str):
        """주소 추가"""
        if address and address.strip():
            self.addresses.add(address.strip())

    def search_companies(self, query: str, limit: int = 10) -> List[str]:
        """대부업체명 검색 (유사 단어)"""
        if not query or not query.strip():
            return []

        query = query.strip().lower()

        # 쿼리를 포함하는 업체명 필터링
        matches = [
            company for company in self.companies
            if query in company.lower()
        ]

        # 정확도 순으로 정렬 (시작하는 것 우선, 그 다음 길이가 짧은 것)
        matches.sort(key=lambda x: (not x.lower().startswith(query), len(x), x))

        return matches[:limit]

    def search_addresses(self, query: str, limit: int = 10) -> List[str]:
        """주소 검색 (유사 단어)"""
        if not query or not query.strip():
            return []

        query = query.strip().lower()

        # 쿼리를 포함하는 주소 필터링
        matches = [
            address for address in self.addresses
            if query in address.lower()
        ]

        # 정확도 순으로 정렬 (시작하는 것 우선, 그 다음 길이가 짧은 것)
        matches.sort(key=lambda x: (not x.lower().startswith(query), len(x), x))

        return matches[:limit]


# 전역 인스턴스 (싱글톤)
search_history = SearchHistory()
