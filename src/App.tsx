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
    <div className="app-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', minHeight: '100vh', boxSizing: 'border-box' }}>
      <header className="app-header no-print" style={{ textAlign: 'center', marginBottom: '45px' }}>
        <h1 style={{ fontFamily: '"Outfit", sans-serif', fontSize: '3rem', fontWeight: '800', margin: '0 0 12px 0', letterSpacing: '-0.04em', background: 'linear-gradient(135deg, #1f2937 0%, #4b5563 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Team Lens
        </h1>
        <p style={{ fontSize: '1.25rem', margin: '0', color: '#6b7280', fontWeight: '500' }}>
          다름을 점수화하지 않고, 협업 대화를 설계합니다
        </p>
      </header>

      <main className="app-content" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
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

      <footer className="no-print" style={{ marginTop: '70px', borderTop: '1px solid #e5e7eb', paddingTop: '30px', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
        &copy; {new Date().getFullYear()} Team Lens. All rights reserved. (교육 수강생 프로젝트 실습용 프로토타입)
      </footer>
    </div>
  );
};

export default App;
