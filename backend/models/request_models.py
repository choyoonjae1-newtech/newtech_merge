from pydantic import BaseModel, Field


class AnalysisRequest(BaseModel):
    """대출 분석 요청 모델"""
    company_name: str = Field(..., description="업체명")
    property_address: str = Field(..., description="담보주소")
    loan_amount: int = Field(..., gt=0, description="대출신청금액")

    class Config:
        json_schema_extra = {
            "example": {
                "company_name": "파란캐피탈대부",
                "property_address": "서울시 강남구 대치동 은마아파트 2동 1203호",
                "loan_amount": 800000000
            }
        }
