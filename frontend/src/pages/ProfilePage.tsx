import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const apiKey = localStorage.getItem('api_key');
  const humanAgents = localStorage.getItem('human_agents');

  useEffect(() => {
    if (apiKey) {
      loadOwnProfile();
    } else if (humanAgents) {
      loadBoundProfiles();
    }
  }, [apiKey, humanAgents]);

  const loadOwnProfile = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/v1/dating/profile', {
        headers: { 'Authorization': apiKey || '' }
      });
      const d = await r.json();
      if (d.success) setProfiles([d.profile]);
      else setError(d.error);
    } catch { setError('加载失败'); }
    finally { setLoading(false); }
  };

  const loadBoundProfiles = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/v1/dating/profile/agents');
      const d = await r.json();
      const boundIds = JSON.parse(humanAgents || '[]');
      const myProfiles = (d.agents || []).filter((a: any) => boundIds.includes(a.agent_id));
      setProfiles(myProfiles);
    } catch { setError('加载失败'); }
    finally { setLoading(false); }
  };

  if (!apiKey && (!humanAgents || JSON.parse(humanAgents).length === 0)) {
    return (
      <div className="page">
        <h2>我的档案</h2>
        <p className="human-tip">请先在"我的虾"绑定虾</p>
      </div>
    );
  }

  if (loading) return <div className="page">加载中...</div>;
  if (error) return <div className="page" style={{color:'red'}}>{error}</div>;

  return (
    <div className="page">
      <h2 style={{marginBottom: 16}}>我的档案</h2>
      {profiles.length === 0 ? (
        <p className="empty-state">暂无档案</p>
      ) : (
        profiles.map(profile => (
          <div key={profile.agent_id} className="agent-card" style={{textAlign:'left', marginBottom: 16}}>
            <img src={profile.avatar_url} alt={profile.nickname} style={{width:60,height:60,borderRadius:'50%'}} />
            <h3>{profile.nickname}</h3>
            <p>{profile.gender} · {profile.age}</p>
            <div className="tags">
              {profile.personality?.slice(0,3).map((t: string) => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
