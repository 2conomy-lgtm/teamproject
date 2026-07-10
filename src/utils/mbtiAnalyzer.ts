import type { TeamInput, TeamAnalysis, AxisCount, ActionGuides } from '../types';

// ANALYSIS_RULES.md 기준 분포 상태 판별 헬퍼
function getAxisStatus(ratioLeft: number, ratioRight: number): '편중' | '균형' | '혼합' {
  if (ratioLeft >= 70 || ratioRight >= 70) return '편중';
  if (ratioLeft >= 40 && ratioLeft <= 60) return '균형';
  return '혼합';
}

// 순수 규칙 기반 팀 분석 엔진 함수
export function analyzeTeam(teamInput: TeamInput): TeamAnalysis {
  // 1. 전체 구성원 목록 통합 (팀장 1명 + 팀원 M명)
  const allMembers = [
    { name: teamInput.leaderName, mbti: teamInput.leaderMbti.toUpperCase() },
    ...teamInput.members.map(m => ({ name: m.name, mbti: m.mbti.toUpperCase() }))
  ];

  const totalCount = allMembers.length;

  // 빈 팀 예외 처리 (수용 기준용 자가 방어 코드)
  if (totalCount === 0) {
    return createEmptyAnalysis();
  }

  // 2. 4대 선호 지표 카운트 초기화
  let eCount = 0, iCount = 0;
  let sCount = 0, nCount = 0;
  let tCount = 0, fCount = 0;
  let jCount = 0, pCount = 0;

  // 인원 세기
  allMembers.forEach(member => {
    const chars = member.mbti.split('');
    if (chars.includes('E')) eCount++;
    if (chars.includes('I')) iCount++;
    if (chars.includes('S')) sCount++;
    if (chars.includes('N')) nCount++;
    if (chars.includes('T')) tCount++;
    if (chars.includes('F')) fCount++;
    if (chars.includes('J')) jCount++;
    if (chars.includes('P')) pCount++;
  });

  // 3. 비율 연산 (ANALYSIS_RULES.md 공식 적용: 정수 반올림 및 합 100 보정)
  const calculateAxis = (leftCount: number, rightCount: number): AxisCount => {
    const ratioLeft = totalCount > 0 ? Math.round((leftCount / totalCount) * 100) : 0;
    const ratioRight = 100 - ratioLeft;
    return {
      countLeft: leftCount,
      countRight: rightCount,
      ratioLeft,
      ratioRight,
      status: getAxisStatus(ratioLeft, ratioRight)
    };
  };

  const ei = calculateAxis(eCount, iCount);
  const sn = calculateAxis(sCount, nCount);
  const tf = calculateAxis(tCount, fCount);
  const jp = calculateAxis(jCount, pCount);

  // 4. 분석 조합용 변수 및 데이터 맵 구성
  const leaderMbti = teamInput.leaderMbti.toUpperCase();
  const leaderChars = leaderMbti.split('');

  const strengths: string[] = [];
  const cautions: string[] = [];
  const leaderAttitudes: string[] = [];
  
  // 상황별 가이드라인 기본 문구 뼈대 세팅
  const actionGuides: ActionGuides = {
    meeting: '소통 통로가 고르게 배분되도록 비동기 서면 의견 수집 방식을 일부 조화롭게 결합해 볼 수 있습니다.',
    decision: '의사결정 시 논리적 타당성 지표와 더불어 팀원들이 실제 체감할 정서적 수용성을 균형 있게 확인해 보는 조치입니다.',
    feedback: '개선 피드백을 전달할 때는 먼저 시도한 노력과 고마운 성과를 1가지 명시적으로 칭찬한 후에 조언하는 조율법을 제안합니다.',
    conflict: '이해관계 대립이 나타날 가능성이 보일 때는 양측의 논리 구조를 판서로 시각화하고 상호 중복되는 타협점을 파인딩하는 대화 세션을 실험합니다.',
    planning: '마감 일정을 수립할 때 최종 제출기한 3일 전에 프로토타입 초안을 서로 동기화하는 중간 마감 마일스톤 제도를 운영해 볼 것을 권장합니다.'
  };

  const teamAgreements: string[] = [
    '회의 중 발언 시간이 특정인에게 집중되지 않도록 1인당 최대 3분 스피치 룰을 적용해 봅니다.',
    '안건 결정 시 찬반 수치 비교를 넘어, 결정으로 상처받을 수 있는 정서적 영향도를 함께 고려합니다.',
    '업무 일정 계획 수립 시 예상치 못한 병목 리스크에 대응할 15% 완충 버퍼 기한을 미리 확보합니다.',
    '주요 아이디어가 개진되면 실행 가능성(Action Item)을 3하 원칙으로 문서화하여 마무리합니다.',
    '서로의 고유한 직무 전문성과 소통 선호를 존중하며, 비난이 아닌 성장을 돕는 제안 중심의 어조를 사용합니다.'
  ];

  // 4.1. 축별 상태 연계 규칙 조합 (ANALYSIS_RULES.md Matrix)
  
  // --- E / I 축 규칙 ---
  if (ei.status === '편중') {
    if (ei.ratioLeft >= 70) {
      strengths.push('활발한 의견 소통과 개방적인 분위기로 빠르고 폭넓게 다양한 아이디어가 제안될 가능성이 큽니다.');
      cautions.push('토론 시간이 길어지거나 구두 개입이 활발한 사람 위주로 논의가 독점되어 신중한 소수 의견이 간과될 우려가 존재합니다.');
      actionGuides.meeting = '회의 전 아젠다를 텍스트로 미리 배포하고, 구두 발표 전 3분 동안 생각을 수기로 메모한 뒤 발언을 분배하는 라운드로빈 방식을 실험해 볼 수 있습니다.';
    } else {
      strengths.push('차분하고 진지한 경청 속에 정돈되고 세밀하게 다듬어진 안건 위주로 안전하게 실천해 나가는 경향이 있습니다.');
      cautions.push('침묵의 빈도가 잦아 진척 속도가 더뎌질 수 있으며, 명시적으로 의견을 묻지 않으면 핵심 우려사항이 내부에서 수렴되지 않을 가능성이 있습니다.');
      actionGuides.meeting = '구두 토론의 부담을 덜기 위해 회의용 공동 메모장(Google Docs 등)에 의견을 먼저 서면으로 기입하고 시작하는 비동기 워크플로우를 장착할 수 있습니다.';
    }
  } else {
    strengths.push('말을 통한 공유 선호자(E)와 침묵 속 정독 선호자(I)가 자연스레 조화되어 완급조절이 가미된 회의 흐름을 보일 수 있습니다.');
    cautions.push('실시간 실시간 구두 대화 위주로 회의를 지속할 경우, 내향 성향의 구성원이 점진적으로 논의 흐름에서 소외감을 축적할 가능성이 있습니다.');
  }

  // --- S / N 축 규칙 ---
  if (sn.status === '편중') {
    if (sn.ratioLeft >= 70) {
      strengths.push('가용한 사실 지표와 과거 검증 데이터를 기반으로 매우 현실적이고 마일스톤이 탄탄한 성과물을 도출하는 잠재력이 있습니다.');
      cautions.push('기존에 일하던 관성적인 해결책에 고착될 우려가 있으며, 파괴적 혁신 기회나 장기 비전 설계에 상대적으로 덜 부합할 수 있습니다.');
      actionGuides.planning = '새로운 아이디어를 구상하는 미팅 단계에서는 "예산 및 인력의 제약조건이 아예 없다고 가정한다면?"이라는 제약 탈피 프레임워크를 15분간 장착해 보는 행동을 권유합니다.';
    } else {
      strengths.push('독창적인 시야와 창의적인 트렌드 예측 능력을 무기로 새롭고 도전적인 컨셉의 가치를 신속히 포착하는 가능성이 큽니다.');
      cautions.push('추상적 계획 수립에만 머무르며 구체적 수치 연산이나 타임라인, 현실적인 리소스 분배를 간과해 실행력이 떨어질 경향이 있습니다.');
      actionGuides.planning = '프로젝트 계획 수립 마지막 단계에서 "이 기획이 오늘 실천되기 위해 필요한 구체적인 첫 행동 3가지는 무엇인가?"를 적는 꼼꼼한 Action Item 체크리스트 작성을 실천해 볼 수 있습니다.';
    }
  } else {
    strengths.push('거시적 미래 방향성(N)의 비전 제시와 미시적인 디테일 세밀성(S)을 융합하여 입체적으로 계획을 완성해 갈 우수한 시너지 잠재력이 있습니다.');
    cautions.push('데이터의 정밀도 눈높이나 용어가 명확하지 않을 때, 서로 겉도는 소통으로 진행 기한이 손실될 우려가 발견될 수 있습니다.');
  }

  // --- T / F 축 규칙 ---
  if (tf.status === '편중') {
    if (tf.ratioLeft >= 70) {
      strengths.push('논리적 타당성과 효율성 극대화를 최우선 목표로 삼아 냉철하고 인과관계가 깔끔한 의사결정을 실천하는 능력이 돋보입니다.');
      cautions.push('업무 개선 피드백을 전달할 때 감정적 배려와 상호 지지 표현이 부족해 팀원들이 관계적 상처를 입거나 수용성이 저하될 가능성이 있습니다.');
      actionGuides.feedback = '피드백 시 업무 내용과 주체를 분리하여 이야기하고, 개선 권고 전에 "해당 파트를 세심히 설계한 정성적 노력"에 대해 최소 1문장의 칭찬을 먼저 배치하는 소통을 제안합니다.';
    } else {
      strengths.push('상호존중과 배려심 넘치는 환경을 자양분 삼아 정서적 심리적 안정감이 두텁게 공유되며 건강한 관계 시너지를 형성하는 경향이 있습니다.');
      cautions.push('서로 오해가 생길까 염려하여 올바른 생산적 쓴소리나 핵심 비판을 기피하여 합리적인 대안 도출 시점을 미룰 우려가 존재합니다.');
      actionGuides.feedback = '건강한 비판 문화를 안전하게 형성하기 위해 개별 인격을 비판하는 대신, 6개의 질문지로 논리 오류만 체크하는 "건강한 구조적 비판 평가표"를 미팅에 장착해 보는 행동이 조력할 수 있습니다.';
    }
  } else {
    strengths.push('합리적인 업무 타당성 조율(T)과 팀원들의 인간적 수용 정서 배려(F)가 맞물려 안정감 있는 의사결정 체계를 가동할 수 있습니다.');
    cautions.push('결정 기준이 매 순간 바뀌는 것처럼 체감되면 구성원 간의 스타일 갈등이 번져 감정적 정서 소모로 고착될 가능성이 있습니다.');
    actionGuides.decision = '회의 기획 단계에서 "이 결정의 타당성 기준 지표 3개"를 회의록 상단에 기록하고 점수를 검증하며 조율해 갈 것을 강력 권고합니다.';
  }

  // --- J / P 축 규칙 ---
  if (jp.status === '편중') {
    if (jp.ratioLeft >= 70) {
      strengths.push('치밀한 타임라인 관리와 체계적 계획 분배를 바탕으로 일정이 늘어지지 않게 관리하는 예측 가능성이 고도로 높습니다.');
      cautions.push('예상치 못하게 아웃풋 조건이 변하거나 기획의 수정 지시가 떨어질 때 극심한 스트레스를 호소하며 거부 반응을 드러낼 우려가 큽니다.');
      actionGuides.decision = '갑작스러운 일정 변화가 감지될 때는 임기응변으로 즉각 대응하기보다 변경된 안건에 대해 24시간 동안 완충 소화 시간을 가질 수 있는 "안건 보류 및 재조율 세션" 제도를 둡니다.';
    } else {
      strengths.push('갑작스러운 변수나 변화 요구에도 임기응변력을 무기 삼아 대안을 민첩하고 유연하게 찾아내는 융통성 순발력이 우수합니다.');
      cautions.push('약속된 마감기한 직전까지 자료 취합이나 의사결정이 유예되어 막판에 병목이 걸리고 완성도 품질이 낙하할 경향이 보입니다.');
      actionGuides.planning = '프로젝트 수립 시 전체 마감 5일 전에 중간 결과물(Draft)을 일시 취합하여 1차 보완하는 "소프트 마일스톤(중간 체크포인트)"을 반드시 캘린더에 기입해 봅니다.';
    }
  } else {
    strengths.push('장기 플랜(J)의 견고함과 변수 상황 대처(P)의 민첩한 순발력을 함께 발휘하여 변수 제어에 능숙한 실행력을 보여줄 수 있습니다.');
    cautions.push('일정 준수의 시각차로 인해 플래닝 방식이 엉키고 팀원들이 서로 업무 생산성을 불신할 수 있는 여지가 감지됩니다.');
  }

  // 4.2. 팀장-팀원 매칭 가이드라인 규칙 조율 (일치형 vs 불일치형)
  
  // E 지표 비교
  const isLeaderMatchE = (ei.ratioLeft > 50 && leaderChars.includes('E')) || (ei.ratioRight > 50 && leaderChars.includes('I'));
  // S 지표 비교
  const isLeaderMatchS = (sn.ratioLeft > 50 && leaderChars.includes('S')) || (sn.ratioRight > 50 && leaderChars.includes('N'));
  // T 지표 비교
  const isLeaderMatchT = (tf.ratioLeft > 50 && leaderChars.includes('T')) || (tf.ratioRight > 50 && leaderChars.includes('F'));

  // E/I 축 보완 태도
  if (isLeaderMatchE) {
    leaderAttitudes.push(`현재 팀 다수 소통 성향과 동일한 에너지 방향을 보유한 만큼 편향되기 쉬우므로, 회의 중 조용히 침묵하는 멤버들에게 의도적으로 서면 서면 공유 창구를 열어두는 태도가 권장됩니다.`);
  } else {
    leaderAttitudes.push(`현재 팀 다수가 선호하는 대화 흐름과 리더의 고유 에너지 궤도가 달라 오해가 생길 수 있으니, "내가 안건을 깊이 소화하고 피드백하는 데 필요한 24시간의 시간적 주기"를 사전에 투명하게 알리고 배려해 주는 리더십 태도가 유용합니다.`);
  }

  // S/N 축 보완 태도
  if (isLeaderMatchS) {
    leaderAttitudes.push(`정보를 인식하고 분석하는 관점이 팀원들과 일관되어 협의가 빠르지만 시야가 고착되기 쉬우니, 기존 프로세스에 "새로운 대안 가능성을 무조건 1개 탐색한다"는 장기 아이디어 제안 단계를 정례화해 볼 것을 조언합니다.`);
  } else {
    leaderAttitudes.push(`팀원들이 정보를 다루는 세밀함이나 거시성과 다른 관점을 가지고 행동하므로 지시 시 "원하는 디테일의 명확한 샘플이나 기대 수치"를 명확하게 상호 합의하는 태도가 소통 누수를 예방합니다.`);
  }

  // T/F 축 보완 태도
  if (isLeaderMatchT) {
    leaderAttitudes.push(`팀원들과 판단의 방향성이 정렬되어 이질감이 적지만 감정적 소외가 가속될 수 있으니, 업무 논쟁 과정 뒤에는 "안건 비판과 인간적 신뢰를 확실히 분리"하여 상호 수고를 명시적으로 지지해 주는 정서적 지지 표현 태도를 장착해 봅니다.`);
  } else {
    leaderAttitudes.push(`팀원들의 판단 준거 우선순위와 리더의 결론 도출 알고리즘 스타일이 대조되므로 의사결정의 이면에 깔린 "논리적 근거 체크표" 혹은 "우려되는 팀원 수용성 지표"를 서로 가감 없이 꺼내어 설명하는 수평적 태도가 신뢰를 다집니다.`);
  }

  // 5. 한 줄 요약 조합 (지표 분포에 따른 보편적 한 줄 연계 가이드)
  let summary = `팀원 상호 간 소통 지표를 렌더링하여 협업 약속을 조율하는 가이드라인입니다.`;
  if (ei.status === '편중' && tf.status === '편중') {
    summary = `목표 수호 및 정밀 판단을 향해 신속하고 합리적으로 직진하면서도, 보이지 않는 소수 의견과 정서적 수용성의 균형을 가볍게 조율해 나가는 팀입니다.`;
  } else if (ei.status === '균형' && tf.status === '균형') {
    summary = `상호 존중의 화합과 합리적 판단의 무게중심을 유연하게 교차하며, 안정적이면서도 건강한 아이디어 발산 리듬을 보유하고 있는 조직입니다.`;
  } else {
    summary = `각자의 고유한 정보 해석 관점과 실행 이행 리듬의 장점을 결합하여, 상황적 돌발 변수 앞에서도 융통성과 플래닝의 기어를 고르게 활용하는 성장 지향형 팀입니다.`;
  }

  // 6. 면책 공고 정의
  const disclaimer = '⚠️ 본 분석은 MBTI 모델에 투영된 보편적인 상호 작용 선호 경향성을 다루며, 개인의 절대적 성격 낙인, 직무 업무 역량 예측, 승진 적격 여부 또는 인적 성과를 진단 및 재단하는 근거로 절대로 활용될 수 없습니다.';

  // 7. 데이터 무결성 조립 및 리턴
  return {
    summary,
    axisDistributions: { ei, sn, tf, jp },
    strengths: strengths.slice(0, 3),
    cautions: cautions.slice(0, 3),
    leaderAttitudes: leaderAttitudes.slice(0, 3),
    actionGuides,
    teamAgreements: teamAgreements.slice(0, 5),
    disclaimer
  };
}

// 수용 기준 상 빈 팀 데이터 입력 시의 기본 대체 분석 객체
function createEmptyAnalysis(): TeamAnalysis {
  const emptyAxis = (): AxisCount => ({
    countLeft: 0,
    countRight: 0,
    ratioLeft: 0,
    ratioRight: 0,
    status: '균형'
  });
  return {
    summary: '아직 분석할 수 있는 팀원 데이터가 확보되지 않았습니다.',
    axisDistributions: {
      ei: emptyAxis(),
      sn: emptyAxis(),
      tf: emptyAxis(),
      jp: emptyAxis()
    },
    strengths: ['분석 정보 없음'],
    cautions: ['분석 정보 없음'],
    leaderAttitudes: ['분석 정보 없음'],
    actionGuides: {
      meeting: '데이터 부족',
      decision: '데이터 없음',
      feedback: '데이터 부족',
      conflict: '데이터 없음',
      planning: '데이터 부족'
    },
    teamAgreements: ['합의 약속 데이터 없음'],
    disclaimer: '⚠️ 팀 데이터가 충분하지 않아 분석을 진행할 수 없습니다.'
  };
}
