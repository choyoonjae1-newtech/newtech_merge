import os
from anthropic import Anthropic
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()


class ClaudeClient:
    """Claude API 클라이언트"""

    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY 환경 변수가 설정되지 않았습니다.")
        self.client = Anthropic(api_key=api_key)
        self.model = "claude-3-5-sonnet-20241022"
        self.max_tokens = 1024

    def analyze(self, prompt: str) -> str:
        """Claude API를 사용한 분석"""
        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            return message.content[0].text
        except Exception as e:
            return f"AI 분석 오류: {str(e)}"

    def analyze_property(self, prompt: str) -> str:
        """물건 분석"""
        return self.analyze(prompt)

    def analyze_rights(self, prompt: str) -> str:
        """권리 분석"""
        return self.analyze(prompt)

    def analyze_market(self, prompt: str) -> str:
        """시세 분석"""
        return self.analyze(prompt)
