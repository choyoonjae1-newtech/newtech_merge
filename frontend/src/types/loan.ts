// 담보 물건 기초 정보
export interface PropertyBasicData {
  address: string;
  units: number;
  corridor_type: string;
  age: number;
  area: number;
  location_score: number;
}

// 담보 물건 권리 정보
export interface PropertyRightsData {
  gap_section: string;
  eul_section: string;
  seizure?: string;
  priority_rank: number;
  max_bond_amount?: number;
  tenant_deposit?: number;
  owner?: string;
}

// 차주 재무 데이터 (연도별)
export interface FinancialYearData {
  year: number;
  assets: number;
  liabilities: number;
  equity: number;
  revenue: number;
  operating_profit: number;
}

// 차주 정보
export interface BorrowerData {
  company_name: string;
  business_number: string;
  financial_data: FinancialYearData[];
}

// 연대보증인 정보
export interface GuarantorData {
  name: string;
  credit_score: number;
  direct_debt: number;
  guarantee_debt: number;
}

// KB 시세
export interface KbPrice {
  estimated: number;
  low: number;
  high: number;
  trend: string;
}

// 국토교통부 실거래가
export interface MolitTransactions {
  recent_price: number;
  transaction_date: string;
  trend: string;
}

// 네이버페이 부동산 매매호가
export interface NaverListings {
  avg_asking: number;
  listing_count: number;
  trend: string;
}

// 크레딧 소스 데이터
export interface CreditSourcesData {
  kb_price: KbPrice;
  molit_transactions: MolitTransactions;
  naver_listings: NaverListings;
}

// 등기부등본 모달 데이터
export interface RegistryModalData {
  address: string;
  owner?: string;
  gap_section: string;
  eul_section: string;
  seizure?: string;
}

// 사용자 정보
export interface User {
  user_id: string;
  company_name?: string;
  ceo_name?: string;
  business_number?: string;
  phone?: string;
  role?: string;
}

// 대출 신청
export interface LoanApplication {
  id: string;
  applicant_id?: string;
  company_name: string;
  ceo_name: string;
  property_address: string;
  loan_amount: number;
  loan_duration: number;
  status: string;
  created_at: string;
}

// KB 시세 이력 포인트
export interface PriceHistoryPoint {
  date: string;
  price: number;
}

// KB 시세 (이력 포함)
export interface KbPriceWithHistory extends KbPrice {
  history: PriceHistoryPoint[];
}

// 국토교통부 실거래가 (이력 포함)
export interface MolitTransactionsWithHistory extends MolitTransactions {
  history: PriceHistoryPoint[];
}

// 네이버 매매호가 (이력 포함)
export interface NaverListingsWithHistory extends NaverListings {
  history: PriceHistoryPoint[];
}

// 크레딧 소스 데이터 (차트용 이력 포함)
export interface CreditDataWithHistory {
  kb_price: KbPriceWithHistory;
  molit_transactions: MolitTransactionsWithHistory;
  naver_listings: NaverListingsWithHistory;
}

// 입지 분석 점수
export interface LocationScores {
  station_walk: number;
  commute_time: number;
  units_score: number;
  school_walk: number;
  living_env: number;
  nature_env: number;
}

// AI 분석 결과
export interface AiAnalysis {
  property_analysis: string;
  rights_analysis: string;
  market_analysis: string;
  comprehensive_opinion: string;
  location_scores?: LocationScores;
}

// 유사 물건
export interface SimilarProperty {
  name: string;
  units: number;
  age: number;
  area: number;
  recent_price: number;
  price_change_rate: number;
  lat: number;
  lng: number;
}

// 인근 유사 물건 동향
export interface NearbyPropertyTrends {
  target_lat: number;
  target_lng: number;
  similar_properties: SimilarProperty[];
}

// 평단가 추이 데이터 포인트
export interface PricePerPyeongPoint {
  date: string;
  complex: number;
  dong: number;
  sigungu: number;
}

// 평단가 추이
export interface PricePerPyeongTrend {
  complex_name: string;
  dong_name: string;
  sigungu_name: string;
  data: PricePerPyeongPoint[];
}

// 분석 응답 전체
export interface AnalysisResponse {
  property_basic_info: PropertyBasicData;
  property_rights_info: PropertyRightsData;
  borrower_info: BorrowerData;
  guarantor_info: GuarantorData;
  credit_data: CreditDataWithHistory;
  ai_analysis: AiAnalysis;
  nearby_property_trends?: NearbyPropertyTrends;
  price_per_pyeong_trend?: PricePerPyeongTrend;
}

// 모니터링 대출 항목
export interface MonitoringLoan {
  loan_id: string;
  auditor_name: string;
  company_name: string;
  ceo_name?: string;
  property_address: string;
  loan_amount: number;
  execution_date: string;
  execution_price: number;
  current_price: number;
  execution_ltv: number;
  current_ltv: number;
  ltv_change: number;
  signal: string;
  signal_label: string;
}

// 모니터링 요약
export interface MonitoringSummary {
  total_count: number;
  green_count: number;
  yellow_count: number;
  red_count: number;
  total_amount: number;
  avg_current_ltv: number;
}

// 모니터링 응답
export interface MonitoringResponse {
  loans: MonitoringLoan[];
  summary: MonitoringSummary;
}
