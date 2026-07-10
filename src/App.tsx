import React, { useState } from 'react';
import { TeamInputForm } from './features/team-input/TeamInputForm';
import { TeamAnalysisDashboard } from './features/team-analysis/TeamAnalysisDashboard';
import type { TeamInput } from './types';
import './App.css';

const App: React.FC = () => {
  // 사용자가 입력 및 검증 완료한 최종 팀 입력 상태 객체
  const [teamInput, setTeamInput] = useState<TeamInput | null>(null);

  const handleAnalyze = (data: TeamInput) => {
    setTeamInput(data);
  };

  // 분석 데이터 초기화 및 홈(폼 입력) 상태로 부드럽게 돌아가기
  const handleReset = () => {
    setTeamInput(null);
  };

  return (
    <div className="app-container" style={{ maxWidth: '960px', margin: '0 auto', padding: '50px 20px', minHeight: '100vh', boxSizing: 'border-box', backgroundColor: '#ffffff' }}>
      
      {/* 콤팩트 미니멀 상단 헤더 */}
      <header className="app-header no-print" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div className="logo-container">
          
          {/* GBSA 공식 로고 - 클릭 시 gbsa.or.kr 새창 연결 */}
          <a 
            href="https://www.gbsa.or.kr" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="gbsa-logo-link"
            title="경기도경제과학진흥원(GBSA) 공식 홈페이지 바로가기"
          >
            <div className="gbsa-logo-wrap">
              <img 
                src="https://www.gbsa.or.kr/images/layout/logo.png" 
                alt="경기도경제과학진흥원 GBSA" 
                className="gbsa-logo-img"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = 'tech-badge';
                    fallback.style.cssText = 'font-size: 0.8rem; font-weight: 700; color: #7c3aed; background: #f5f3ff; padding: 6px 16px; border-radius: 6px; border: 1px solid rgba(124,58,237,0.15);';
                    fallback.innerText = '🏢 경기도경제과학진흥원 (GBSA)';
                    parent.appendChild(fallback);
                  }
                }}
              />
            </div>
          </a>

          {/* 콤팩트 세련된 프로젝트 타이틀 */}
          <h1 className="logo-title">Team Lens</h1>
          
          {/* 간단한 설명 문구 */}
          <p className="logo-subtitle">
            다름을 점수화하지 않고, 오직 상호 존중성을 기반으로 협업 대화를 설계하는 MBTI 소통 파트너
          </p>

          {/* 기술 스택 미니멀 배지 라인 */}
          <div className="tech-badge-container">
            <span className="tech-badge">React 18</span>
            <span className="tech-badge">TypeScript</span>
            <span className="tech-badge">Vite App</span>
            <span className="tech-badge">Vanilla CSS</span>
            <span className="tech-badge" style={{ color: '#2563eb', backgroundColor: '#eff6ff', borderColor: 'rgba(37,99,235,0.15)' }}>GBSA 실습지원</span>
          </div>
        </div>
      </header>

      <main className="app-content" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        {/* 메인 페이지(폼 입력 단계)에 노출할 간단한 앱 기능 소개 글 상자 */}
        {!teamInput && (
          <section className="intro-box">
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111827', margin: '0 0 8px 0', textAlign: 'center' }}>
              💡 Team Lens 플랫폼 소개 및 활용 가이드
            </h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.6', textAlign: 'justify', textJustify: 'inter-word' }}>
              본 도구는 경기도경제과학진흥원(GBSA)의 소통 역량 강화 교육을 위해 특화 설계된 <strong>미니멀 소규모 팀 진단 소통 서포터</strong>입니다. 
              각 구성원들의 고유한 성향(MBTI) 차이를 점수나 우열로 평가하여 줄 세우지 않으며, 오직 나와 동료의 고유성을 수용하는 것에서 소통의 해법을 찾습니다. 
              아래에 리더와 팀원들의 성향을 간편하게 입력하시면, 우리 팀만을 위한 <strong>잠재 강점, 주의점 분석 결과와 함께 5대 행동요령 및 그라운드 룰 규칙</strong>을 콤팩트하게 즉각 도출해 드립니다.
            </p>
          </section>
        )}

        {/* 입력 모드 vs 결과 모드 대화형 멀티 뷰 스위칭 */}
        {!teamInput ? (
          <section className="input-section">
            <TeamInputForm onAnalyze={handleAnalyze} />
          </section>
        ) : (
          <section className="analysis-section">
            <TeamAnalysisDashboard inputData={teamInput} onReset={handleReset} />
          </section>
        )}
      </main>

      {/* 콤팩트 하단 푸터 - 경과원 2차 링크 장착 */}
      <footer className="no-print" style={{ marginTop: '70px', borderTop: '1px solid #e5e7eb', paddingTop: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#6b7280', fontSize: '0.85rem', textAlign: 'center' }}>
        <a 
          href="https://www.gbsa.or.kr" 
          target="_blank" 
          rel="noopener noreferrer"
          title="경기도경제과학진흥원 바로가기"
          style={{ opacity: 0.8, transition: 'opacity 0.2s' }}
        >
          <img 
            src="https://www.gbsa.or.kr/images/layout/logo.png" 
            alt="GBSA" 
            style={{ height: '28px', objectFit: 'contain' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </a>
        <div style={{ fontWeight: '500' }}>
          &copy; {new Date().getFullYear()} Team Lens & 경기도경제과학진흥원(GBSA). All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;

