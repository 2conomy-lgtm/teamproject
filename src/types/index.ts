// Team Lens 핵심 데이터 타입 정의 (ANALYSIS_RULES.md 및 UI_SPEC.md의 최종 필드 명세 반영)

export interface TeamMember {
  id: string; // 동적 리스트 추가/삭제 및 고유 렌더링 키를 위한 UUID 또는 고유문자열
  name: string; // 팀원 별칭/이름
  mbti: string; // 16가지 표준 MBTI (ex. INFP, ENTJ)
  gender: 'male' | 'female'; // 성별 정보 ('male': 남성, 'female': 여성)
}

export interface TeamInput {
  teamName: string; // 팀 이름
  leaderName: string; // 팀장 별칭/이름
  leaderMbti: string; // 팀장 MBTI
  leaderGender: 'male' | 'female'; // 팀장 성별 정보 ('male': 남성, 'female': 여성)
  members: TeamMember[]; // 팀원 리스트 (최소 2인 이상 필수)
}

export interface AxisCount {
  countLeft: number;  // 왼쪽 지표 (E, S, T, J) 누적 인원수
  countRight: number; // 오른쪽 지표 (I, N, F, P) 누적 인원수
  ratioLeft: number;  // 왼쪽 지표 비율 (%) - 정수 반올림
  ratioRight: number; // 오른쪽 지표 비율 (%) - 정수 반올림
  status: '편중' | '균형' | '혼합'; // ANALYSIS_RULES.md에 정의된 분포 상태
}

export interface ActionGuides {
  meeting: string;     // 회의 시 행동요령
  decision: string;    // 의사결정 시 행동요령
  feedback: string;    // 피드백 전달 시 행동요령
  conflict: string;    // 갈등 상황 시 행동요령
  planning: string;    // 일정 관리/계획 시 행동요령
}

export interface TeamAnalysis {
  summary: string; // 팀 한 줄 요약
  axisDistributions: {
    ei: AxisCount; // E vs I 분포
    sn: AxisCount; // S vs N 분포
    tf: AxisCount; // T vs F 분포
    jp: AxisCount; // J vs P 분포
  };
  strengths: string[]; // 팀의 잠재 강점 3개
  cautions: string[]; // 주의해야 할 점 3개 (위험 신호)
  leaderAttitudes: string[]; // 팀장이 가져야 할 태도 3개
  actionGuides: ActionGuides; // 5대 비즈니스 맥락별 구체적 가이드
  teamAgreements: string[]; // 팀이 합의할 5개의 협업 약속 (Core Ground Rules)
  disclaimer: string; // 데이터 윤리 및 경고 가이드라인 면책 문구
  genderStats?: {
    maleCount: number;
    femaleCount: number;
    insight: string; // 성별 다원성과 MBTI 성향(특히 T/F)의 상호작용 분석 통찰 조언
  };
}
