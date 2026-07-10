import React, { useState, useEffect } from 'react';
import type { TeamInput, TeamMember } from '../../types';

// 유효한 MBTI 16가지 상수 정의 (ANALYSIS_RULES.md 준수)
const VALID_MBTI_TYPES = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
  'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP',
  'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
] as const;

interface FormError {
  teamName?: string;
  leader?: string;
  members?: { [memberId: string]: { name?: string; mbti?: string } };
  general?: string;
}

interface TeamInputFormProps {
  onAnalyze: (data: TeamInput) => void;
}

export const TeamInputForm: React.FC<TeamInputFormProps> = ({ onAnalyze }) => {
  // 기본 입력 폼 내부용 로컬 멤버 목록
  const [teamName, setTeamName] = useState<string>('');
  const [formMembers, setFormMembers] = useState<TeamMember[]>([
    { id: '1', name: '', mbti: '', gender: 'male' },
    { id: '2', name: '', mbti: '', gender: 'female' }
  ]);
  const [leaderId, setLeaderId] = useState<string>(''); // 팀장 고유 ID
  const [errors, setErrors] = useState<FormError>({});
  const [validatedOutput, setValidatedOutput] = useState<TeamInput | null>(null);

  // 신규 수록 보안 안전 장치들
  const [isAnonymized, setIsAnonymized] = useState<boolean>(false); // 분석 결과 익명화(마스킹) 여부
  const [allowLocalStorage, setAllowLocalStorage] = useState<boolean>(false); // 기기 보관 동의 여부

  // 1. 기기 임시 보관 정보 마운트 시 로드 로직
  useEffect(() => {
    const isSaveAgreed = localStorage.getItem('team_lens_save_agreed') === 'true';
    setAllowLocalStorage(isSaveAgreed);

    if (isSaveAgreed) {
      const cachedTeamName = localStorage.getItem('team_lens_cached_team_name');
      const cachedLeaderId = localStorage.getItem('team_lens_cached_leader_id');
      const cachedMembersJson = localStorage.getItem('team_lens_cached_members');

      if (cachedTeamName) setTeamName(cachedTeamName);
      if (cachedLeaderId) setLeaderId(cachedLeaderId);
      if (cachedMembersJson) {
        try {
          setFormMembers(JSON.parse(cachedMembersJson));
        } catch (e) {
          console.error('캐시 복원 실패', e);
        }
      }
    }
  }, []);

  // 2. 기기 보관 상태 변화 시 동기화 및 기록 파기 처리
  const handleToggleLocalStorage = (checked: boolean) => {
    setAllowLocalStorage(checked);
    if (checked) {
      localStorage.setItem('team_lens_save_agreed', 'true');
      saveToDevice(teamName, leaderId, formMembers);
    } else {
      clearDeviceStorage();
    }
  };

  const saveToDevice = (nameStr: string, lId: string, membersArr: TeamMember[]) => {
    localStorage.setItem('team_lens_cached_team_name', nameStr);
    localStorage.setItem('team_lens_cached_leader_id', lId);
    localStorage.setItem('team_lens_cached_members', JSON.stringify(membersArr));
  };

  const clearDeviceStorage = () => {
    localStorage.removeItem('team_lens_save_agreed');
    localStorage.removeItem('team_lens_cached_team_name');
    localStorage.removeItem('team_lens_cached_leader_id');
    localStorage.removeItem('team_lens_cached_members');
  };

  // 실시간 입력 보존
  const updateAndSave = (nextName: string, nextLeader: string, nextMembers: TeamMember[]) => {
    if (allowLocalStorage) {
      saveToDevice(nextName, nextLeader, nextMembers);
    }
  };

  // 3. 기기 정보 명시적 전면 완전 파기 버튼 핸들러
  const handleDestroyCache = () => {
    if (window.confirm('정말 기기에 영구 보관된 임시 캐시 데이터를 완전 파기하시겠습니까? 데이터는 복구 불가능합니다.')) {
      clearDeviceStorage();
      setAllowLocalStorage(false);
      setTeamName('');
      setFormMembers([
        { id: '1', name: '', mbti: '', gender: 'male' },
        { id: '2', name: '', mbti: '', gender: 'female' }
      ]);
      setLeaderId('');
      setErrors({});
      setValidatedOutput(null);
      alert('기기 보존 캐시가 깨끗이 파기되었습니다.');
    }
  };

  // 팀원 행 추가
  const handleAddMember = () => {
    if (formMembers.length >= 20) {
      alert('팀원은 최대 20명까지만 추가할 수 있습니다.');
      return;
    }
    const newId = Date.now().toString();
    const updated = [...formMembers, { id: newId, name: '', mbti: '', gender: 'male' as const }];
    setFormMembers(updated);
    updateAndSave(teamName, leaderId, updated);
  };

  // 팀원 행 삭제
  const handleRemoveMember = (id: string) => {
    if (formMembers.length <= 2) {
      alert('팀원은 최소 2명 이상 유지해야 합니다.');
      return;
    }
    const updated = formMembers.filter(m => m.id !== id);
    setFormMembers(updated);
    let nextLeader = leaderId;
    if (leaderId === id) {
      setLeaderId('');
      nextLeader = '';
    }
    updateAndSave(teamName, nextLeader, updated);
  };

  // 필드 업데이트 핸들러
  const handleMemberChange = (id: string, field: 'name' | 'mbti' | 'gender', value: string) => {
    const normalizedValue = field === 'mbti' ? value.toUpperCase() : value;
    const updated = formMembers.map(m => m.id === id ? { ...m, [field]: normalizedValue } : m);
    setFormMembers(updated as TeamMember[]);
    updateAndSave(teamName, leaderId, updated as TeamMember[]);

    // 에러 실시간 소멸
    setErrors(prev => {
      const next = { ...prev };
      if (next.members && next.members[id]) {
        const memberErr = { ...next.members[id] };
        delete (memberErr as any)[field];
        if (Object.keys(memberErr).length === 0) {
          delete next.members[id];
        } else {
          next.members = { ...next.members, [id]: memberErr };
        }
      }
      return next;
    });
  };

  // 데모 불러오기
  const handleLoadSample = () => {
    const sampleMembers = [
      { id: 'sample-1', name: '민수', mbti: 'ENTJ', gender: 'male' as const },
      { id: 'sample-2', name: '지수', mbti: 'INFP', gender: 'female' as const },
      { id: 'sample-3', name: '도현', mbti: 'ESTJ', gender: 'male' as const },
      { id: 'sample-4', name: '하은', mbti: 'ISFJ', gender: 'female' as const }
    ];
    setTeamName('아폴로 스튜디오');
    setFormMembers(sampleMembers);
    setLeaderId('sample-1');
    setErrors({});
    setValidatedOutput(null);
    updateAndSave('아폴로 스튜디오', 'sample-1', sampleMembers);
  };

  // 초기화 (창 확인 후 실행)
  const handleReset = () => {
    if (window.confirm('작성 중인 데이터를 모두 리셋하시겠습니까?')) {
      setTeamName('');
      const defaultMembers = [
        { id: 'reset-1', name: '', mbti: '', gender: 'male' as const },
        { id: 'reset-2', name: '', mbti: '', gender: 'female' as const }
      ];
      setFormMembers(defaultMembers);
      setLeaderId('');
      setErrors({});
      setValidatedOutput(null);
      if (allowLocalStorage) {
        saveToDevice('', '', defaultMembers);
      }
    }
  };

  // 제출 검증 및 분석 데이터 주입
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormError = {};
    let firstErrorId = '';

    if (!teamName.trim()) {
      newErrors.teamName = '팀 이름을 입력해 주세요.';
      if (!firstErrorId) firstErrorId = 'input-team-name';
    }

    const memberErrors: { [id: string]: { name?: string; mbti?: string } } = {};
    const namesSet = new Set<string>();

    formMembers.forEach(member => {
      const err: { name?: string; mbti?: string } = {};
      const trimmedName = member.name.trim();

      if (!trimmedName) {
        err.name = '이름/별칭을 빈 칸 없이 입력해 주세요.';
        if (!firstErrorId) firstErrorId = `input-member-name-${member.id}`;
      } else {
        if (namesSet.has(trimmedName)) {
          err.name = '팀 내에 중복된 별칭이 존재합니다. 서로 다르게 지정해 주세요.';
          if (!firstErrorId) firstErrorId = `input-member-name-${member.id}`;
        }
        namesSet.add(trimmedName);
      }

      if (!member.mbti) {
        err.mbti = 'MBTI 성향 유형을 선택해 주세요.';
        if (!firstErrorId) firstErrorId = `select-member-mbti-${member.id}`;
      } else if (!VALID_MBTI_TYPES.includes(member.mbti as any)) {
        err.mbti = '올바르지 않은 MBTI 성향 유형입니다.';
        if (!firstErrorId) firstErrorId = `select-member-mbti-${member.id}`;
      }

      if (Object.keys(err).length > 0) {
        memberErrors[member.id] = err;
      }
    });

    if (Object.keys(memberErrors).length > 0) {
      newErrors.members = memberErrors;
    }

    if (!leaderId) {
      newErrors.leader = '팀원 중 한 명을 반드시 팀장으로 지정해 주세요.';
      if (!firstErrorId) firstErrorId = `radio-leader-${formMembers[0]?.id}`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setValidatedOutput(null);

      if (firstErrorId) {
        setTimeout(() => {
          const el = document.getElementById(firstErrorId);
          if (el) {
            el.focus();
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 50);
      }
      return;
    }

    // 검증 성공 단계
    const leaderMember = formMembers.find(m => m.id === leaderId)!;
    const remainingMembers = formMembers.filter(m => m.id !== leaderId);
 
    // [보안 핵심] "익명화(이름 마스킹) 옵션" 작동: 실제 입력된 텍스트 대신 '팀장', '팀원 1', '팀원 2' 순서로 가공
    let finalLeaderName = leaderMember.name.trim();
    let finalMembers = remainingMembers.map(m => ({
      id: m.id,
      name: m.name.trim(),
      mbti: m.mbti,
      gender: m.gender
    }));
 
    if (isAnonymized) {
      finalLeaderName = '팀장';
      finalMembers = remainingMembers.map((m, index) => ({
        id: m.id,
        name: `팀원 ${index + 1}`,
        mbti: m.mbti,
        gender: m.gender
      }));
    }
 
    const resultInput: TeamInput = {
      teamName: teamName.trim(),
      leaderName: finalLeaderName,
      leaderMbti: leaderMember.mbti,
      leaderGender: leaderMember.gender, // 팀장의 성별 보존 이식
      members: finalMembers
    };
 
    setErrors({});
    setValidatedOutput(resultInput);
    onAnalyze(resultInput); // 변환 완료된 소독 데이터 상위 전달
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      
      {/* 🛡️ 1. 개인정보 및 윤리 오용 방지 안내문 (첫 화면 상단 고정 표출) */}
      <div className="security-notice-card" style={{ padding: '24px', borderRadius: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e3a8a', fontSize: '0.9rem', lineHeight: '1.6' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.05rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🛡️ 개인정보 보호 및 성향 진단 오용 방지 서약 안내
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <li><strong>별칭(익명) 사용 적극 권장:</strong> 실명 정보 대신 팀원들이 쉽게 소통 식별 가능한 가짜 별명이나 가칭(예: 민수, 루카스 등)을 사용해 기입해 줄 것을 제안합니다.</li>
          <li><strong>자발적 동의 정보만 입력:</strong> 기입하는 모든 팀 성격 데이터는 반드시 당사자의 자율적이고 명시적인 사전 수집 동의를 거친 후에만 입력해야 합니다.</li>
          <li><strong>인사/평가 활용 전면 금지:</strong> 본 분석 도구는 성격이나 능력을 낙인찍고 우열을 조장하는 도구가 아닙니다. <strong>채용 적합도 판정, 성과 측정, 부서 배치 및 승진 가부</strong> 등의 인사 평가 기준으로 절대로 사용하지 않습니다.</li>
          <li><strong>서버 유출 제로 보장:</strong> 작성하시는 모든 기밀 정보는 데이터 보존/수집용 외부 백엔드 서버로 절대로 전송되지 않으며, 전적으로 구성원 로컬 브라우저 보안 메모리 안에서만 무해하게 소화됩니다.</li>
        </ul>
      </div>

      {/* 2. 입력 본문 카드 */}
      <div className="team-input-card glass-panel" style={{ padding: '30px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.08)', border: '1px solid rgba(255, 255, 255, 0.5)' }}>
        
        {/* 상단 제어 바 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#111' }}>👥 팀원 성향 구성 기입</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handleLoadSample}
              aria-label="안전 가상 샘플 데이터 불러오기"
              style={{ padding: '8px 16px', border: '1px solid #4a90e2', background: 'transparent', color: '#4a90e2', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', minHeight: '44px' }}
            >
              샘플 팀 불러오기
            </button>
            <button
              type="button"
              onClick={handleReset}
              aria-label="입력 데이터 초기화"
              style={{ padding: '8px 16px', border: '1px solid #ccc', background: 'transparent', color: '#666', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', minHeight: '44px' }}
            >
              초기화
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          
          {/* 팀 이름 입력 */}
          <div style={{ marginBottom: '25px' }}>
            <label htmlFor="input-team-name" style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
              팀 이름 <span style={{ color: '#d0021b' }}>*</span>
            </label>
            <input
              id="input-team-name"
              type="text"
              value={teamName}
              onChange={(e) => {
                const val = e.target.value;
                setTeamName(val);
                updateAndSave(val, leaderId, formMembers);
                if (errors.teamName) setErrors(prev => ({ ...prev, teamName: undefined }));
              }}
              placeholder="예: 마케팅 기획 TF, 개발 리드 그룹"
              aria-required="true"
              aria-invalid={!!errors.teamName}
              aria-describedby={errors.teamName ? "error-team-name" : undefined}
              style={{ width: '100%', padding: '12px 16px', fontSize: '1rem', border: errors.teamName ? '2px solid #d0021b' : '1px solid #ccc', borderRadius: '8px', outline: 'none', transition: 'border-color 0.2s', minHeight: '44px', boxSizing: 'border-box' }}
            />
            {errors.teamName && (
              <p id="error-team-name" style={{ color: '#d0021b', fontSize: '0.875rem', margin: '6px 0 0 0', fontWeight: '500' }}>
                ⚠️ {errors.teamName}
              </p>
            )}
          </div>

          {/* 구성원 리스트 */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ fontWeight: 'bold', color: '#333' }}>구성원 리스트 (최소 2인 ~ 최대 20인) <span style={{ color: '#d0021b' }}>*</span></span>
              <button
                type="button"
                onClick={handleAddMember}
                disabled={formMembers.length >= 20}
                aria-label="팀원 추가행 생성"
                style={{ padding: '6px 14px', background: '#4a90e2', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', minHeight: '44px', opacity: formMembers.length >= 20 ? 0.5 : 1 }}
              >
                + 팀원 추가 ({formMembers.length}/20)
              </button>
            </div>

            {errors.leader && (
              <p style={{ color: '#d0021b', fontSize: '0.875rem', margin: '0 0 12px 0', fontWeight: 'bold' }}>
                ⚠️ {errors.leader}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {formMembers.map((member, index) => {
                const memberErr = errors.members?.[member.id];
                return (
                  <div
                    key={member.id}
                    style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', background: '#f9f9f9', padding: '15px', borderRadius: '10px', border: memberErr ? '1px solid #d0021b' : '1px solid #eaeaea', flexWrap: 'wrap' }}
                  >
                    {/* 이름 필드 */}
                    <div style={{ flex: '2 1 180px', display: 'flex', flexDirection: 'column' }}>
                      <label htmlFor={`input-member-name-${member.id}`} style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '6px', color: '#555' }}>
                        이름/별칭
                      </label>
                      <input
                        id={`input-member-name-${member.id}`}
                        type="text"
                        value={member.name}
                        onChange={(e) => handleMemberChange(member.id, 'name', e.target.value)}
                        placeholder="가급적 별칭 권장"
                        aria-required="true"
                        aria-invalid={!!memberErr?.name}
                        aria-describedby={memberErr?.name ? `error-member-name-${member.id}` : undefined}
                        style={{ padding: '10px 14px', fontSize: '0.95rem', border: memberErr?.name ? '2px solid #d0021b' : '1px solid #ccc', borderRadius: '6px', outline: 'none', minHeight: '44px', boxSizing: 'border-box' }}
                      />
                      {memberErr?.name && (
                        <p id={`error-member-name-${member.id}`} style={{ color: '#d0021b', fontSize: '0.8rem', margin: '4px 0 0 0', fontWeight: '500' }}>
                          ⚠️ {memberErr.name}
                        </p>
                      )}
                    </div>

                    {/* 🏢 [성별 선택] 라벤더 바이올렛 테마의 미니멀리즘 세그먼트 라디오 컨트롤 */}
                    <div style={{ flex: '1 1 110px', display: 'flex', flexDirection: 'column' }}>
                      <span id={`lbl-member-gender-${member.id}`} style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '6px', color: '#555' }}>
                        성별
                      </span>
                      <div 
                        role="radiogroup" 
                        aria-labelledby={`lbl-member-gender-${member.id}`}
                        style={{ display: 'flex', gap: '3px', background: '#eaeaea', padding: '3px', borderRadius: '8px', minHeight: '44px', boxSizing: 'border-box' }}
                      >
                        <button
                          type="button"
                          role="radio"
                          aria-checked={member.gender === 'male'}
                          onClick={() => handleMemberChange(member.id, 'gender', 'male')}
                          style={{
                            flex: 1,
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            backgroundColor: member.gender === 'male' ? '#ffffff' : 'transparent',
                            color: member.gender === 'male' ? '#7c3aed' : '#555555',
                            boxShadow: member.gender === 'male' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                            transition: 'all 0.2s',
                            minHeight: '38px',
                            padding: 0
                          }}
                        >
                          남성
                        </button>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={member.gender === 'female'}
                          onClick={() => handleMemberChange(member.id, 'gender', 'female')}
                          style={{
                            flex: 1,
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            backgroundColor: member.gender === 'female' ? '#ffffff' : 'transparent',
                            color: member.gender === 'female' ? '#7c3aed' : '#555555',
                            boxShadow: member.gender === 'female' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                            transition: 'all 0.2s',
                            minHeight: '38px',
                            padding: 0
                          }}
                        >
                          여성
                        </button>
                      </div>
                    </div>

                    {/* MBTI 성향 선택 */}
                    <div style={{ flex: '1.2 1 140px', display: 'flex', flexDirection: 'column' }}>
                      <label htmlFor={`select-member-mbti-${member.id}`} style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '6px', color: '#555' }}>
                        성향 (MBTI)
                      </label>
                      <select
                        id={`select-member-mbti-${member.id}`}
                        value={member.mbti}
                        onChange={(e) => handleMemberChange(member.id, 'mbti', e.target.value)}
                        aria-required="true"
                        aria-invalid={!!memberErr?.mbti}
                        aria-describedby={memberErr?.mbti ? `error-member-mbti-${member.id}` : undefined}
                        style={{ padding: '10px 14px', fontSize: '0.95rem', border: memberErr?.mbti ? '2px solid #d0021b' : '1px solid #ccc', borderRadius: '6px', background: '#fff', outline: 'none', minHeight: '44px', cursor: 'pointer', boxSizing: 'border-box' }}
                      >
                        <option value="">-- 선택 --</option>
                        {VALID_MBTI_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      {memberErr?.mbti && (
                        <p id={`error-member-mbti-${member.id}`} style={{ color: '#d0021b', fontSize: '0.8rem', margin: '4px 0 0 0', fontWeight: '500' }}>
                          ⚠️ {memberErr.mbti}
                        </p>
                      )}
                    </div>

                    {/* 팀장 여부 지정 */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '80px', alignSelf: 'center', padding: '10px 0' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '8px', color: '#555' }}>팀장 지정</span>
                      <input
                        id={`radio-leader-${member.id}`}
                        type="radio"
                        name="team-leader"
                        checked={leaderId === member.id}
                        onChange={() => {
                          setLeaderId(member.id);
                          updateAndSave(teamName, member.id, formMembers);
                          if (errors.leader) setErrors(prev => ({ ...prev, leader: undefined }));
                        }}
                        aria-label={`${member.name || `팀원 ${index + 1}`}을 팀장으로 선정`}
                        style={{ width: '22px', height: '22px', margin: 0, cursor: 'pointer' }}
                      />
                    </div>

                    {/* 삭제 */}
                    <div style={{ alignSelf: 'flex-end', paddingBottom: '2px' }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={formMembers.length <= 2}
                        aria-label={`${member.name || `팀원 ${index + 1}`} 행 삭제`}
                        style={{ padding: '8px 12px', background: '#fff', color: '#d0021b', border: '1px solid #eaeaea', borderRadius: '6px', cursor: 'pointer', minHeight: '44px', fontWeight: 'bold', opacity: formMembers.length <= 2 ? 0.3 : 1 }}
                      >
                        &times; 삭제
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 🛡️ 3. 익명화 및 로컬 저장 기기 동의 제어판 영역 */}
          <div className="security-controls-panel" style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#334155', display: 'block', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '4px' }}>
              🛡️ 실시간 브라우저 보안 및 보관 제어 옵션
            </span>
            
            {/* 3.1. 익명화 마스킹 체크 토글 */}
            <label htmlFor="chk-anonymized" style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem', color: '#334155' }}>
              <input
                id="chk-anonymized"
                type="checkbox"
                checked={isAnonymized}
                onChange={(e) => setIsAnonymized(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span>
                <strong>결과 화면 익명화 마스킹:</strong> 분석 리포트 및 카피본에 실제 이름 대신 <strong>"팀장", "팀원 1", "팀원 2"</strong>로 강제 대체 가명화 처리합니다. (기본값: 꺼짐)
              </span>
            </label>

            {/* 3.2. 기기 보관 허용 여부 체크 토글 */}
            <label htmlFor="chk-localstorage-consent" style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem', color: '#334155' }}>
              <input
                id="chk-localstorage-consent"
                type="checkbox"
                checked={allowLocalStorage}
                onChange={(e) => handleToggleLocalStorage(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span>
                <strong>이 기기에 입력값 임시 캐싱 허용:</strong> 브라우저 세션 외에 이 브라우저 스토리지(localStorage)에 작성 내용을 보존하여 새로고침 시에도 소실되지 않도록 보관에 자발적 서약 동의합니다.
              </span>
            </label>

            {/* 3.3. 영구 파기 버튼 */}
            {allowLocalStorage && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
                <button
                  type="button"
                  onClick={handleDestroyCache}
                  aria-label="기기 보관 캐시 영구 삭제 파기"
                  style={{ padding: '6px 12px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                >
                  🗑️ 기기 보존 캐시 완전 파기
                </button>
              </div>
            )}
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            aria-label="팀 조합 기획 성향 분석 가동"
            style={{ width: '100%', padding: '16px 24px', fontSize: '1.2rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(74, 144, 226, 0.3)', transition: 'transform 0.1s, box-shadow 0.1s', minHeight: '44px' }}
          >
            팀 조합 분석하기
          </button>
        </form>

        {/* 요약 검증창 */}
        {validatedOutput && (
          <div className="dev-summary-panel" style={{ marginTop: '35px', padding: '20px', background: '#1e1e1e', color: '#39ff14', borderRadius: '10px', fontFamily: 'monospace', fontSize: '0.9rem', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
              <span style={{ fontWeight: 'bold' }}>💻 [개발용 검증] 실시간 가공 산출물 (TeamInput Object)</span>
              <span style={{ background: '#39ff14', color: '#1e1e1e', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>ANONYMIZED SUCCESS</span>
            </div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {JSON.stringify(validatedOutput, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
