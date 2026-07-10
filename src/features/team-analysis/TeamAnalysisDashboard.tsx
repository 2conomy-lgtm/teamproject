import React, { useState } from 'react';
import type { TeamInput } from '../../types';
import { analyzeTeam } from '../../utils/mbtiAnalyzer';

interface TeamAnalysisDashboardProps {
  inputData: TeamInput | null;
  onReset: () => void; // 다시 입력하기 트리거
}

export const TeamAnalysisDashboard: React.FC<TeamAnalysisDashboardProps> = ({ inputData, onReset }) => {
  const [toastMessage, setToastMessage] = useState<string>('');

  if (!inputData) {
    return (
      <div className="empty-dashboard-card glass-panel" style={{ padding: '40px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05)', border: '1px solid rgba(255, 255, 255, 0.5)', textAlign: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '1.1rem', margin: 0, fontWeight: '500' }}>
          👥 상단 폼에 팀원 정보를 입력하고 <strong>[팀 조합 분석하기]</strong> 버튼을 누르면, 성향 분포 게이지 바 및 정밀 맞춤 보고서가 실시간으로 이곳에 렌더링됩니다.
        </p>
      </div>
    );
  }

  // 분석 엔진을 사용한 결과 수급 (순수 함수 호출)
  const analysis = analyzeTeam(inputData);
  const totalCount = 1 + inputData.members.length; // 팀장 1명 + 팀원 수

  // 1. 전체 텍스트 복사 기능 구현
  const handleCopyText = () => {
    const textTemplate = `
[Team Lens 분석 보고서] - ${inputData.teamName}
총 인원수: ${totalCount}명 (팀장: ${inputData.leaderName} / 팀원 ${inputData.members.length}명)

■ 팀 한 줄 요약:
${analysis.summary}

■ 네 축 분포 정보:
- 외향/내향 (E vs I): 외향 ${analysis.axisDistributions.ei.ratioLeft}% (${analysis.axisDistributions.ei.countLeft}명) / 내향 ${analysis.axisDistributions.ei.ratioRight}% (${analysis.axisDistributions.ei.countRight}명) [${analysis.axisDistributions.ei.status}]
- 감각/직관 (S vs N): 감각 ${analysis.axisDistributions.sn.ratioLeft}% (${analysis.axisDistributions.sn.countLeft}명) / 직관 ${analysis.axisDistributions.sn.ratioRight}% (${analysis.axisDistributions.sn.countRight}명) [${analysis.axisDistributions.sn.status}]
- 사고/감정 (T vs F): 사고 ${analysis.axisDistributions.tf.ratioLeft}% (${analysis.axisDistributions.tf.countLeft}명) / 감정 ${analysis.axisDistributions.tf.ratioRight}% (${analysis.axisDistributions.tf.countRight}명) [${analysis.axisDistributions.tf.status}]
- 판단/인식 (J vs P): 판단 ${analysis.axisDistributions.jp.ratioLeft}% (${analysis.axisDistributions.jp.countLeft}명) / 인식 ${analysis.axisDistributions.jp.ratioRight}% (${analysis.axisDistributions.jp.countRight}명) [${analysis.axisDistributions.jp.status}]

■ 팀의 잠재 강점:
${analysis.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

■ 주의해야 할 점 (위험 신호):
${analysis.cautions.map((c, i) => `${i + 1}. ${c}`).join('\n')}

■ 팀장으로서 가져야 할 태도:
${analysis.leaderAttitudes.map((a, i) => `${i + 1}. ${a}`).join('\n')}

■ 맥락별 행동요령:
- [회의] 상황: 실시간 브레인스토밍 시 / 행동: ${analysis.actionGuides.meeting} / 확인: 소수 의견을 경청하고 안건에 적극 반영했는가?
- [의사결정] 상황: 최종 방향 합의 결정 시 / 행동: ${analysis.actionGuides.decision} / 확인: 타당한 논리 인과와 정서적 수용성을 두루 검토했는가?
- [피드백] 상황: 상호 조언 조율 시 / 행동: ${analysis.actionGuides.feedback} / 확인: 비난이 아닌 격려를 담아 성장 중심의 조언을 전했는가?
- [갈등] 상황: 상반된 이견 충돌 대립 시 / 행동: ${analysis.actionGuides.conflict} / 확인: 감정을 분리하고 논리 팩트만 판서 시각화했는가?
- [일정] 상황: 릴리즈 타임라인 계획 시 / 행동: ${analysis.actionGuides.planning} / 확인: 돌발 예방 완충 버퍼 및 중간 마감일을 캘린더에 기입했는가?

■ 이번 팀의 협업 약속 (체크리스트):
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

  // 2. 브라우저 인쇄 실행 기능
  const handlePrint = () => {
    window.print();
  };

  // 맥락별 상황 가이드라인 매핑 데이터 ("상황 - 할 행동 - 확인 질문" 양식 준수)
  const contextList = [
    {
      title: '회의 (Meeting)',
      context: '팀 실시간 브레인스토밍 및 토론 진행 시',
      action: analysis.actionGuides.meeting,
      question: '특정 목소리 큰 사람에게 회의 시간이 편중되지 않고 고른 기회가 배분되었는가?'
    },
    {
      title: '의사결정 (Decision)',
      context: '주요 기술 아키텍처 및 안건의 최종 조율 결정 시',
      action: analysis.actionGuides.decision,
      question: '냉철한 인과 인센티브 논리와 팀원의 정서적 수용 정서의 타협안을 고르게 도출했는가?'
    },
    {
      title: '피드백 (Feedback)',
      context: '생산적인 상호 검토 조언 및 코드 리뷰 공유 시',
      action: analysis.actionGuides.feedback,
      question: '비판에 앞서 긍정 수고를 먼저 칭찬하는 지지형 피드백을 전달했는가?'
    },
    {
      title: '갈등 관리 (Conflict)',
      context: '상반된 이해관계나 의견 대립이 팽팽하게 고착될 때',
      action: analysis.actionGuides.conflict,
      question: '관계 소모 감정을 즉각 소거하고 논리적 차이를 시각화하여 확인했는가?'
    },
    {
      title: '일정 계획 (Planning)',
      context: '프로젝트 마일스톤 타임라인 구성 및 목표 수립 시',
      action: analysis.actionGuides.planning,
      question: '중도 포기를 미연에 막는 소프트 완충 마일스톤과 일일 점검을 캘린더에 기입했는가?'
    }
  ];

  return (
    <div className="analysis-result-panel" style={{ display: 'flex', flexDirection: 'column', gap: '30px', boxSizing: 'border-box' }}>
      
      {/* 클립보드 복사 알림 토스트 팝업 */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#333', color: '#fff', padding: '12px 24px', borderRadius: '8px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontWeight: 'bold' }}>
          ✨ {toastMessage}
        </div>
      )}

      {/* 1. 상단 타이틀 영역 */}
      <div className="no-print glass-panel" style={{ padding: '30px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.5)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <span style={{ fontSize: '0.875rem', fontWeight: 'bold', background: '#e5e7eb', padding: '4px 10px', borderRadius: '20px', color: '#4b5563' }}>
              분석 결과
            </span>
            <h2 style={{ fontSize: '1.8rem', margin: '8px 0 0 0', fontWeight: '800', color: '#111' }}>
              📊 팀 [ {inputData.teamName} ] 조합 보고서
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.95rem' }}>
              총원 <strong>{totalCount}명</strong> (팀장: <strong>{inputData.leaderName}</strong> / 팀원 <strong>{inputData.members.length}명</strong>)
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            aria-label="데이터 다시 입력하기"
            style={{ padding: '10px 20px', border: '1px solid #4b5563', background: 'transparent', color: '#4b5563', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', minHeight: '44px' }}
          >
            ← 정보 다시 입력
          </button>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)', padding: '20px', borderRadius: '10px', borderLeft: '5px solid #4a90e2' }}>
          <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#1f2937', lineHeight: '1.5' }}>
            💬 {analysis.summary}
          </p>
        </div>
      </div>

      {/* 인쇄 전용 헤더 영역 (화면상 미표출, Ctrl+P 시에만 인출) */}
      <div className="print-only" style={{ display: 'none', borderBottom: '2px solid #111', paddingBottom: '15px', marginBottom: '25px' }}>
        <h1 style={{ fontSize: '2.2rem', margin: 0, fontWeight: 'bold' }}>Team Lens 팀 분석 결과서</h1>
        <p style={{ margin: '8px 0 0 0', fontSize: '1.1rem', color: '#555' }}>
          대상 팀: <strong>{inputData.teamName}</strong> | 분석일: {new Date().toLocaleDateString('ko-KR')} | 총원: {totalCount}명
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#000' }}>
          요약: {analysis.summary}
        </p>
      </div>

      {/* 2. 네 축 분포 패널 */}
      <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #eaeaea' }}>
        <h3 style={{ fontSize: '1.25rem', margin: '0 0 20px 0', color: '#111', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
          📊 네 축 선호 분포 (Axis Distribution)
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '-10px 0 20px 0' }}>
          * 색맹이나 약시 구성원들을 위해 비율 수치와 라벨 텍스트를 함께 제공합니다.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {Object.entries({
            '외향형 (E) vs 내향형 (I)': analysis.axisDistributions.ei,
            '감각형 (S) vs 직관형 (N)': analysis.axisDistributions.sn,
            '사고형 (T) vs 감정형 (F)': analysis.axisDistributions.tf,
            '판단형 (J) vs 인식형 (P)': analysis.axisDistributions.jp
          }).map(([axisTitle, axis]) => {
            const isDominant = axis.status === '편중';
            const labelLeft = axisTitle.split('vs')[0].trim();
            const labelRight = axisTitle.split('vs')[1].trim();

            return (
              <div key={axisTitle} style={{ padding: '15px', borderRadius: '10px', background: isDominant ? '#fffcf0' : '#fcfcfc', border: isDominant ? '1px solid #fcd34d' : '1px solid #eaeaea' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem', fontWeight: 'bold', color: '#333' }}>
                  <span>{axisTitle}</span>
                  <span style={{ color: isDominant ? '#d97706' : '#4b5563', fontSize: '0.85rem', background: isDominant ? '#fef3c7' : '#e5e7eb', padding: '2px 8px', borderRadius: '4px' }}>
                    상태: {axis.status}
                  </span>
                </div>

                {/* 시각 게이지 바 (막대 그래프) */}
                <div style={{ height: '24px', background: '#e5e7eb', borderRadius: '12px', overflow: 'hidden', display: 'flex', position: 'relative' }}>
                  <div style={{ width: `${axis.ratioLeft}%`, background: isDominant ? '#d97706' : '#4a90e2', transition: 'width 0.5s ease', height: '100%', display: 'flex', alignItems: 'center', paddingLeft: '12px', boxSizing: 'border-box' }}>
                    {axis.ratioLeft >= 15 && (
                      <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>{axis.ratioLeft}%</span>
                    )}
                  </div>
                  <div style={{ width: `${axis.ratioRight}%`, background: isDominant ? '#f59e0b' : '#34d399', transition: 'width 0.5s ease', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '12px', boxSizing: 'border-box' }}>
                    {axis.ratioRight >= 15 && (
                      <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>{axis.ratioRight}%</span>
                    )}
                  </div>
                </div>

                {/* 텍스트 정보 매핑 (라벨/인원수 접근성 충족) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.85rem', color: '#555' }}>
                  <span>{labelLeft}: {axis.countLeft}명 ({axis.ratioLeft}%)</span>
                  <span>{labelRight}: {axis.countRight}명 ({axis.ratioRight}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3, 4, 5 영역: 강점 / 주의점 / 리더 태도 (가로 배치 대응) */}
      <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* 잠재 강점 */}
        <div className="glass-panel" style={{ padding: '25px', borderRadius: '16px', background: '#fff', border: '1px solid #eaeaea' }}>
          <h3 style={{ fontSize: '1.2rem', margin: '0 0 15px 0', color: '#1e3a8a', borderBottom: '1px solid #eff6ff', paddingBottom: '10px' }}>
            🌟 팀의 잠재 강점
          </h3>
          <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', color: '#374151', fontSize: '0.95rem', lineHeight: '1.6' }}>
            {analysis.strengths.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>

        {/* 주의해야 할 점 */}
        <div className="glass-panel" style={{ padding: '25px', borderRadius: '16px', background: '#fff', border: '1px solid #eaeaea' }}>
          <h3 style={{ fontSize: '1.2rem', margin: '0 0 15px 0', color: '#b91c1c', borderBottom: '1px solid #fef2f2', paddingBottom: '10px' }}>
            ⚠️ 주의해야 할 점 (위험 신호)
          </h3>
          <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', color: '#374151', fontSize: '0.95rem', lineHeight: '1.6' }}>
            {analysis.cautions.map((c, idx) => (
              <li key={idx}>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 5. 팀장 리더십 태도 카드 */}
      <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px', background: '#fff', border: '1px solid #eaeaea' }}>
        <h3 style={{ fontSize: '1.25rem', margin: '0 0 15px 0', color: '#047857', borderBottom: '1px solid #ecfdf5', paddingBottom: '10px' }}>
          👑 팀장으로서 가져야 할 유연한 태도 지침
        </h3>
        <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', color: '#374151', fontSize: '0.95rem', lineHeight: '1.6' }}>
          {analysis.leaderAttitudes.map((a, idx) => (
            <li key={idx}>{a}</li>
          ))}
        </ul>
      </div>

      {/* 6. 맥락별 세부 행동요령 */}
      <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px', background: '#fff', border: '1px solid #eaeaea' }}>
        <h3 style={{ fontSize: '1.25rem', margin: '0 0 20px 0', color: '#111', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
          ⚙️ 5대 맥락별 구체적 협업 행동요령
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {contextList.map((item, index) => (
            <div key={index} style={{ padding: '20px', borderRadius: '10px', background: '#fcfcfc', border: '1px solid #eaeaea' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#2563eb' }}>
                {index + 1}. {item.title}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.95rem', lineHeight: '1.6' }}>
                <p style={{ margin: 0, color: '#374151' }}>
                  📌 <strong>상황:</strong> {item.context}
                </p>
                <p style={{ margin: 0, color: '#1f2937', background: '#f3f4f6', padding: '10px 14px', borderRadius: '6px', borderLeft: '3px solid #2563eb' }}>
                  🎯 <strong>할 행동:</strong> {item.action}
                </p>
                <p style={{ margin: 0, color: '#047857', fontStyle: 'italic', fontWeight: '500' }}>
                  ❓ <strong>확인 질문:</strong> {item.question}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. 협업 약속 체크리스트 */}
      <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px', background: '#fff', border: '1px solid #eaeaea' }}>
        <h3 style={{ fontSize: '1.25rem', margin: '0 0 20px 0', color: '#111', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
          ✅ 이번 팀을 위한 5대 협업 약속 (Core Agreements)
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '-10px 0 20px 0' }}>
          * 회의나 워크숍 시작 시 다 함께 동의 여부를 확인해 볼 수 있는 체크리스트 그라운드 룰입니다.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {analysis.teamAgreements.map((rule, idx) => (
            <label
              key={idx}
              htmlFor={`chk-agreement-${idx}`}
              style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#fafafa', padding: '14px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', color: '#374151', border: '1px solid #f0f0f0', transition: 'background 0.2s', minHeight: '44px', boxSizing: 'border-box' }}
            >
              <input
                id={`chk-agreement-${idx}`}
                type="checkbox"
                defaultChecked={false}
                style={{ width: '20px', height: '20px', cursor: 'pointer', marginTop: '2px', flexShrink: 0 }}
              />
              <span style={{ lineHeight: '1.5' }}>
                <strong>약속 {idx + 1}:</strong> {rule}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 8. 윤리 고지 사항 (Disclaimer) */}
      <div style={{ background: '#fef2f2', border: '1px dashed #fca5a5', padding: '20px', borderRadius: '10px', color: '#b91c1c', fontSize: '0.85rem', lineHeight: '1.6' }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>
          {analysis.disclaimer}
        </p>
      </div>

      {/* 9. 제어 및 공유 바 영역 */}
      <div className="no-print" style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleCopyText}
          aria-label="결과 전체 텍스트 복사하기"
          style={{ padding: '12px 24px', fontSize: '1rem', fontWeight: 'bold', background: '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', minHeight: '44px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
        >
          📄 전체 결과 텍스트 복사
        </button>
        <button
          type="button"
          onClick={handlePrint}
          aria-label="보고서 인쇄 및 PDF 저장하기"
          style={{ padding: '12px 24px', fontSize: '1rem', fontWeight: 'bold', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', minHeight: '44px', boxShadow: '0 4px 10px rgba(37,99,235,0.15)' }}
        >
          🖨️ 보고서 인쇄 (PDF 저장)
        </button>
      </div>
    </div>
  );
};
