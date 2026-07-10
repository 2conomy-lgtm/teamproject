import React, { useState } from 'react';
import type { TeamInput } from '../../types';
import { analyzeTeam } from '../../utils/mbtiAnalyzer';

interface TeamAnalysisDashboardProps {
  inputData: TeamInput | null;
  onReset: () => void;
}

export const TeamAnalysisDashboard: React.FC<TeamAnalysisDashboardProps> = ({ inputData, onReset }) => {
  const [toastMessage, setToastMessage] = useState<string>('');
  const [completedAgreements, setCompletedAgreements] = useState<{ [key: number]: boolean }>({});

  if (!inputData) {
    return (
      <div className="empty-dashboard-card glass-panel" style={{ padding: '50px 40px', borderRadius: '24px', textAlign: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '1.2rem', margin: 0, fontWeight: '600', letterSpacing: '-0.01em' }}>
          👥 상단 폼에 팀원 정보를 입력하고 <strong>[팀 조합 분석하기]</strong> 버튼을 누르면, 성향 분포 게이지 바 및 정밀 맞춤 보고서가 실시간으로 이곳에 렌더링됩니다.
        </p>
      </div>
    );
  }

  const analysis = analyzeTeam(inputData);
  const totalCount = 1 + inputData.members.length;

  const handleCopyText = () => {
    const textTemplate = `
[Team Lens 분석 보고서] - ${inputData.teamName}
총 인원수: ${totalCount}명 (팀장: ${inputData.leaderName} / 팀원 ${inputData.members.length}명 | 남성 ${analysis.genderStats?.maleCount ?? 0}명, 여성 ${analysis.genderStats?.femaleCount ?? 0}명)

■ 팀 한 줄 요약:
${analysis.summary}

■ 성별 다원성 기반 의사소통 시너지 조언:
${analysis.genderStats?.insight ?? '해당 없음'}

■ 네 축 분포 정보:
- 외향/내향 (E vs I): 외향 ${analysis.axisDistributions.ei.ratioLeft}% / 내향 ${analysis.axisDistributions.ei.ratioRight}% [${analysis.axisDistributions.ei.status}]
- 감각/직관 (S vs N): 감각 ${analysis.axisDistributions.sn.ratioLeft}% / 직관 ${analysis.axisDistributions.sn.ratioRight}% [${analysis.axisDistributions.sn.status}]
- 사고/감정 (T vs F): 사고 ${analysis.axisDistributions.tf.ratioLeft}% / 감정 ${analysis.axisDistributions.tf.ratioRight}% [${analysis.axisDistributions.tf.status}]
- 판단/인식 (J vs P): 판단 ${analysis.axisDistributions.jp.ratioLeft}% / 인식 ${analysis.axisDistributions.jp.ratioRight}% [${analysis.axisDistributions.jp.status}]

■ 팀의 잠재 강점:
${analysis.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

■ 주의해야 할 점 (위험 신호):
${analysis.cautions.map((c, i) => `${i + 1}. ${c}`).join('\n')}

■ 팀장으로서 가져야 할 태도:
${analysis.leaderAttitudes.map((a, i) => `${i + 1}. ${a}`).join('\n')}

■ 맥락별 행동요령:
- [회의]: ${analysis.actionGuides.meeting}
- [의사결정]: ${analysis.actionGuides.decision}
- [피드백]: ${analysis.actionGuides.feedback}
- [갈등]: ${analysis.actionGuides.conflict}
- [일정]: ${analysis.actionGuides.planning}

■ 이번 팀의 협업 약속:
${analysis.teamAgreements.map((a, i) => `[ ] ${i + 1}. ${a}`).join('\n')}

----------------------------------------------------
${analysis.disclaimer}
    `.trim();

    navigator.clipboard.writeText(textTemplate)
      .then(() => {
        setToastMessage('클립보드에 보고서 전체가 성공적으로 복사되었습니다!');
        setTimeout(() => setToastMessage(''), 3000);
      })
      .catch(() => {
        alert('복사에 실패했습니다. 권한을 확인해 주세요.');
      });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleToggleAgreement = (idx: number) => {
    setCompletedAgreements(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const contextList = [
    {
      title: '회의 (Meeting)',
      context: '팀 실시간 브레인스토밍 및 토론 진행 시',
      action: analysis.actionGuides.meeting,
      question: '특정 목소리 큰 사람에게 회의 시간이 편중되지 않고 고른 기회가 배분되었는가?',
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.04)'
    },
    {
      title: '의사결정 (Decision)',
      context: '주요 기술 아키텍처 및 안건의 최종 조율 결정 시',
      action: analysis.actionGuides.decision,
      question: '냉철한 인과 인센티브 논리와 팀원의 정서적 수용 정서의 타협안을 고르게 도출했는가?',
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.04)'
    },
    {
      title: '피드백 (Feedback)',
      context: '생산적인 상호 검토 조언 및 코드 리뷰 공유 시',
      action: analysis.actionGuides.feedback,
      question: '비판에 앞서 긍정 수고를 먼저 칭찬하는 지지형 피드백을 전달했는가?',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.04)'
    },
    {
      title: '갈등 관리 (Conflict)',
      context: '상반된 이해관계나 의견 대립이 팽팽하게 고착될 때',
      action: analysis.actionGuides.conflict,
      question: '관계 소모 감정을 즉각 소거하고 논리적 차이를 시각화하여 확인했는가?',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.04)'
    },
    {
      title: '일정 계획 (Planning)',
      context: '프로젝트 마일스톤 타임라인 구성 및 목표 수립 시',
      action: analysis.actionGuides.planning,
      question: '중도 포기를 미연에 막는 소프트 완충 마일스톤과 일일 점검을 캘린더에 기입했는가?',
      color: '#ec4899',
      bg: 'rgba(236, 72, 153, 0.04)'
    }
  ];

  return (
    <div className="analysis-result-panel dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '35px', boxSizing: 'border-box' }}>
      
      {/* 1. 복사 토스트 알림 */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: '#38bdf8', padding: '16px 28px', borderRadius: '12px', zIndex: 1000, boxShadow: '0 10px 25px rgba(0,0,0,0.2)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(56, 189, 248, 0.3)', fontSize: '0.95rem' }}>
          <span>✨</span> {toastMessage}
        </div>
      )}

      {/* 2. 상단 헤더 글래스 보드 */}
      <div className="no-print glass-panel" style={{ padding: '35px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)', border: '1px solid rgba(255, 255, 255, 0.8)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', padding: '6px 14px', borderRadius: '30px', color: '#3730a3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📊 REPORT GENERATED
            </div>
            <h2 style={{ fontSize: '2.2rem', margin: '12px 0 6px 0', fontWeight: '800', color: '#1e1b4b', letterSpacing: '-0.03em' }}>
              👥 {inputData.teamName} 분석 보고서
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <p style={{ margin: 0, color: '#4b5563', fontSize: '1.05rem', fontWeight: '500' }}>
                총원 <strong style={{ color: '#312e81' }}>{totalCount}명</strong> (팀장: <strong style={{ color: '#312e81' }}>{inputData.leaderName}</strong> / 팀원 <strong>{inputData.members.length}명</strong>)
              </p>
              {analysis.genderStats && (
                <span style={{ fontSize: '0.8rem', background: '#eae8ff', color: '#7c3aed', padding: '2px 10px', borderRadius: '20px', fontWeight: 'bold', border: '1px solid rgba(124, 58, 237, 0.15)' }}>
                  남성 {analysis.genderStats.maleCount}명 / 여성 {analysis.genderStats.femaleCount}명
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onReset}
            aria-label="데이터 다시 입력하기"
            style={{ padding: '12px 24px', border: '1px solid #c7d2fe', background: '#ffffff', color: '#312e81', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', minHeight: '44px', boxShadow: '0 4px 12px rgba(49, 46, 129, 0.05)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>↩️</span> 정보 다시 입력
          </button>
        </div>
        
        {/* 요약 강조 피드백 블록 */}
        <div style={{ background: 'linear-gradient(135deg, #eef2f6 0%, #e0e7ff 100%)', padding: '24px', borderRadius: '16px', borderLeft: '6px solid #4f46e5', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.02)' }}>
          <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#1e1b4b', lineHeight: '1.6', textAlign: 'justify' }}>
            💬 {analysis.summary}
          </p>
        </div>

        {/* 🔮 성별 다원성 기반 의사소통 시너지 조언 블록 */}
        {analysis.genderStats && (
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(243, 232, 255, 0.5) 0%, rgba(237, 233, 254, 0.5) 100%)', 
            padding: '24px', 
            borderRadius: '16px', 
            borderLeft: '6px solid #7c3aed', 
            boxShadow: 'inset 0 2px 8px rgba(124, 58, 237, 0.02)',
            borderTop: '1px solid rgba(124, 58, 237, 0.1)',
            borderRight: '1px solid rgba(124, 58, 237, 0.1)',
            borderBottom: '1px solid rgba(124, 58, 237, 0.1)'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: '800', color: '#5b21b6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔮 성별 다원성 기반 의사소통 시너지 조언
              <span style={{ 
                fontSize: '0.75rem', 
                background: '#ffffff', 
                color: '#7c3aed', 
                padding: '3px 10px', 
                borderRadius: '20px', 
                border: '1px solid rgba(124, 58, 237, 0.2)',
                fontWeight: '700'
              }}>
                성비 구성: 남성 {analysis.genderStats.maleCount}명 / 여성 {analysis.genderStats.femaleCount}명
              </span>
            </h4>
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500', color: '#2e1065', lineHeight: '1.65', textAlign: 'justify', wordBreak: 'keep-all' }}>
              {analysis.genderStats.insight}
            </p>
          </div>
        )}
      </div>

      {/* 인쇄 전용 머리말 */}
      <div className="print-only" style={{ display: 'none', borderBottom: '3px double #111', paddingBottom: '15px', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0, fontWeight: '800', textAlign: 'center' }}>Team Lens 협업 대화 보고서</h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '1.1rem', color: '#333', textAlign: 'center', fontWeight: 'bold' }}>
          팀명: {inputData.teamName} | 총원: {totalCount}명 (리더: {inputData.leaderName} | 남성: {analysis.genderStats?.maleCount ?? 0}명, 여성: {analysis.genderStats?.femaleCount ?? 0}명) | 분석일: {new Date().toLocaleDateString('ko-KR')}
        </p>
        <p style={{ margin: '15px 0 0 0', fontSize: '1.2rem', fontWeight: '700', color: '#000', background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
          요약 총평: {analysis.summary}
        </p>
        {analysis.genderStats && (
          <p style={{ margin: '10px 0 0 0', fontSize: '1rem', fontWeight: '500', color: '#111', background: '#faf5ff', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #7c3aed', textAlign: 'justify' }}>
            성별 다원성 조언: {analysis.genderStats.insight}
          </p>
        )}
      </div>

      {/* 3. 네 축 선호 분포 대시보드 - SaaS 계량형 차트화 */}
      <div className="glass-panel" style={{ padding: '35px', borderRadius: '24px', background: '#ffffff', border: '1px solid rgba(229, 231, 235, 0.7)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '18px', marginBottom: '25px' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', margin: 0, color: '#1e1b4b', fontWeight: '800', letterSpacing: '-0.02em' }}>
              📊 네 축 선호 성향 분포 지표 (Axis Balance)
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '4px 0 0 0' }}>
              * 각 인풋 수치와 축 지표의 편중, 균형, 혼합 상태를 실시간 연산하여 매핑합니다.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {Object.entries({
            '외향성 (Extraversion) vs 내향성 (Introversion)': analysis.axisDistributions.ei,
            '감각 (Sensing) vs 직관 (iNtuition)': analysis.axisDistributions.sn,
            '사고 (Thinking) vs 감정 (Feeling)': analysis.axisDistributions.tf,
            '판단 (Judging) vs 인식 (Perceiving)': analysis.axisDistributions.jp
          }).map(([axisTitle, axis]) => {
            const isDominant = axis.status === '편중';
            const labelLeft = axisTitle.split('vs')[0].trim();
            const labelRight = axisTitle.split('vs')[1].trim();

            // 호화로운 네온 그라데이션 컬러링
            let leftGradient = 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)';
            let rightGradient = 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
            
            if (isDominant) {
              leftGradient = 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)';
              rightGradient = 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)';
            }

            return (
              <div key={axisTitle} style={{ padding: '20px', borderRadius: '16px', background: isDominant ? 'rgba(254, 243, 199, 0.25)' : 'rgba(248, 250, 252, 0.6)', border: isDominant ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(226, 232, 240, 0.8)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e1b4b' }}>{axisTitle}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', background: isDominant ? '#fef3c7' : '#e0e7ff', color: isDominant ? '#b45309' : '#3730a3', padding: '4px 10px', borderRadius: '30px', border: isDominant ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(55,48,163,0.1)' }}>
                    {axis.status} 상태
                  </span>
                </div>

                {/* 3D 둥근 게이지 바 */}
                <div style={{ height: '30px', background: '#e2e8f0', borderRadius: '30px', overflow: 'hidden', display: 'flex', position: 'relative', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.06)' }}>
                  <div style={{ width: `${axis.ratioLeft}%`, background: leftGradient, transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)', height: '100%', display: 'flex', alignItems: 'center', paddingLeft: '16px', boxSizing: 'border-box', boxShadow: 'inset 0 -2px 5px rgba(0,0,0,0.1)' }}>
                    {axis.ratioLeft >= 15 && (
                      <span style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: '800', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{axis.ratioLeft}%</span>
                    )}
                  </div>
                  <div style={{ width: `${axis.ratioRight}%`, background: rightGradient, transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '16px', boxSizing: 'border-box', boxShadow: 'inset 0 -2px 5px rgba(0,0,0,0.1)' }}>
                    {axis.ratioRight >= 15 && (
                      <span style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: '800', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{axis.ratioRight}%</span>
                    )}
                  </div>
                </div>

                {/* 하단 세부 수치 접근성 레이블 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.9rem', color: '#4b5563', fontWeight: '500' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isDominant ? '#ef4444' : '#3b82f6' }}></span>
                    {labelLeft}: <strong>{axis.countLeft}명</strong> ({axis.ratioLeft}%)
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isDominant ? '#f59e0b' : '#10b981' }}></span>
                    {labelRight}: <strong>{axis.countRight}명</strong> ({axis.ratioRight}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. 잠재 강점 및 위험 카드 (입체형 보더 그라데이션) */}
      <div className="grid-2-col">
        
        {/* 강점 카드 */}
        <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(209, 250, 229, 0.4) 0%, rgba(240, 253, 250, 0.4) 100%)', border: '1px solid rgba(16, 185, 129, 0.25)', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.03)' }}>
          <h3 style={{ fontSize: '1.35rem', margin: '0 0 18px 0', color: '#065f46', fontWeight: '800', borderBottom: '1px solid rgba(16, 185, 129, 0.15)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🌟</span> 팀의 잠재 강점
          </h3>
          <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '14px', color: '#0f766e', fontSize: '1rem', fontWeight: '500' }}>
            {analysis.strengths.map((s, idx) => (
              <li key={idx} style={{ paddingLeft: '4px' }}>{s}</li>
            ))}
          </ul>
        </div>

        {/* 위험 신호 카드 */}
        <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.4) 0%, rgba(255, 251, 235, 0.4) 100%)', border: '1px solid rgba(245, 158, 11, 0.25)', boxShadow: '0 10px 25px rgba(245, 158, 11, 0.03)' }}>
          <h3 style={{ fontSize: '1.35rem', margin: '0 0 18px 0', color: '#92400e', fontWeight: '800', borderBottom: '1px solid rgba(245, 158, 11, 0.15)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️</span> 주의해야 할 점 (위험 신호)
          </h3>
          <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '14px', color: '#b45309', fontSize: '1rem', fontWeight: '500' }}>
            {analysis.cautions.map((c, idx) => (
              <li key={idx} style={{ paddingLeft: '4px' }}>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 5. 팀장 리더십 유연 태도 지침 카드 (로열 퍼플 테마) */}
      <div className="glass-panel" style={{ padding: '35px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(238, 242, 255, 0.5) 0%, rgba(245, 243, 255, 0.5) 100%)', border: '1px solid rgba(139, 92, 246, 0.25)', boxShadow: '0 10px 25px rgba(139, 92, 246, 0.03)' }}>
        <h3 style={{ fontSize: '1.4rem', margin: '0 0 18px 0', color: '#4c1d95', fontWeight: '800', borderBottom: '1px solid rgba(139, 92, 246, 0.15)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>👑</span> 리더(팀장)로서 가져야 할 보완적 리더십 가이드
        </h3>
        <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '14px', color: '#5b21b6', fontSize: '1.05rem', fontWeight: '500' }}>
          {analysis.leaderAttitudes.map((a, idx) => (
            <li key={idx} style={{ paddingLeft: '4px' }}>{a}</li>
          ))}
        </ul>
      </div>

      {/* 6. 맥락별 5대 협업 행동요령 */}
      <div className="glass-panel" style={{ padding: '35px', borderRadius: '24px', background: '#ffffff', border: '1px solid rgba(229, 231, 235, 0.7)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '1.4rem', margin: '0 0 25px 0', color: '#1e1b4b', fontWeight: '800', borderBottom: '1px solid #f3f4f6', paddingBottom: '15px' }}>
          ⚙️ 5대 맥락별 구체적 행동 강령 (Collaboration Guides)
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {contextList.map((item, index) => (
            <div key={index} style={{ padding: '24px', borderRadius: '18px', background: item.bg, border: `1px solid rgba(226, 232, 240, 0.8)`, transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '1.2rem', color: item.color, fontWeight: '800' }}>
                  {index + 1}. {item.title}
                </h4>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', background: '#ffffff', color: item.color, padding: '4px 10px', borderRadius: '20px', border: `1px solid ${item.color}33` }}>
                  SITUATIONAL GUIDE
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '1rem', lineHeight: '1.6' }}>
                <p style={{ margin: 0, color: '#4b5563', fontWeight: '500' }}>
                  📌 <strong>상황 맥락:</strong> {item.context}
                </p>
                <p style={{ margin: 0, color: '#1e1b4b', background: '#ffffff', padding: '14px 18px', borderRadius: '10px', borderLeft: `5px solid ${item.color}`, boxShadow: '0 2px 8px rgba(0,0,0,0.01)', fontWeight: '600' }}>
                  🎯 <strong>할 행동 지침:</strong> {item.action}
                </p>
                <p style={{ margin: 0, color: '#047857', fontStyle: 'italic', fontWeight: '600', paddingLeft: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>❓</span> <strong>체크용 질문:</strong> {item.question}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. 그라운드 룰 협업 약속 체크 카드 */}
      <div className="glass-panel" style={{ padding: '35px', borderRadius: '24px', background: '#ffffff', border: '1px solid rgba(229, 231, 235, 0.7)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '1.4rem', margin: '0 0 12px 0', color: '#1e1b4b', fontWeight: '800' }}>
          ✅ 이번 팀을 위한 5대 협업 약속 (Core Ground Rules)
        </h3>
        <p style={{ fontSize: '0.95rem', color: '#6b7280', margin: '0 0 25px 0' }}>
          * 구성원 간의 소통 마찰을 줄이기 위해 워크숍 시작 전 다 함께 동의 여부를 확인해 볼 수 있는 인터랙티브 행동 약속 카드입니다.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {analysis.teamAgreements.map((rule, idx) => {
            const isChecked = !!completedAgreements[idx];
            return (
              <label
                key={idx}
                htmlFor={`chk-agreement-${idx}`}
                style={{ display: 'flex', gap: '16px', alignItems: 'center', background: isChecked ? 'linear-gradient(135deg, rgba(209,250,229,0.3) 0%, rgba(167,243,205,0.3) 100%)' : 'rgba(248,250,252,0.8)', padding: '18px 22px', borderRadius: '14px', cursor: 'pointer', fontSize: '1.05rem', color: isChecked ? '#065f46' : '#1f2937', border: isChecked ? '1px solid #10b981' : '1px solid rgba(226,232,240,0.8)', boxShadow: isChecked ? '0 4px 15px rgba(16,185,129,0.08)' : 'none', transition: 'all 0.25s ease', minHeight: '44px', boxSizing: 'border-box' }}
              >
                <input
                  id={`chk-agreement-${idx}`}
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleAgreement(idx)}
                  style={{ width: '22px', height: '22px', cursor: 'pointer', flexShrink: 0, accentColor: '#10b981' }}
                />
                <span style={{ lineHeight: '1.5', fontWeight: isChecked ? '700' : '500' }}>
                  <strong style={{ color: isChecked ? '#047857' : '#4f46e5', marginRight: '6px' }}>약속 {idx + 1}:</strong> {rule}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 8. 안전 윤리 고지 카드 */}
      <div style={{ background: '#fff5f5', border: '1px dashed #fecaca', padding: '24px', borderRadius: '16px', color: '#991b1b', fontSize: '0.9rem', lineHeight: '1.6', boxShadow: '0 4px 12px rgba(153,27,27,0.02)' }}>
        <p style={{ margin: 0, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚠️</span> {analysis.disclaimer}
        </p>
      </div>

      {/* 9. 메인 기능 버튼 바 */}
      <div className="no-print" style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleCopyText}
          aria-label="결과 전체 텍스트 복사하기"
          style={{ padding: '14px 28px', fontSize: '1.05rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: '#ffffff', border: 'none', borderRadius: '12px', cursor: 'pointer', minHeight: '44px', boxShadow: '0 8px 20px rgba(49,46,129,0.15)', transition: 'transform 0.1s' }}
        >
          📄 전체 결과 텍스트 복사
        </button>
        <button
          type="button"
          onClick={handlePrint}
          aria-label="보고서 인쇄 및 PDF 저장하기"
          style={{ padding: '14px 28px', fontSize: '1.05rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#ffffff', border: 'none', borderRadius: '12px', cursor: 'pointer', minHeight: '44px', boxShadow: '0 8px 20px rgba(37,99,235,0.15)', transition: 'transform 0.1s' }}
        >
          🖨️ 보고서 인쇄 (PDF 저장)
        </button>
      </div>
    </div>
  );
};
