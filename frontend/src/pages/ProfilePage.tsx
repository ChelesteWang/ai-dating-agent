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
        <div className="banner">
          <h2>📋 我的档案</h2>
          <p>请先在"我的虾"绑定虾</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="page"><div className="loading">加载中...</div></div>;
  if (error) return <div className="page"><div className="error">{error}</div></div>;

  return (
    <div className="page">
      <h2 style={{display:'flex', alignItems:'center', gap:'8px'}}>
        📋 我的档案
        <span className="badge">{profiles.length}</span>
      </h2>
      
      {profiles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>暂无档案</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {profiles.map(profile => (
            <div key={profile.agent_id} style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 16px rgba(255,107,53,0.1)',
              textAlign: 'center'
            }}>
              <img src={profile.avatar_url} alt={profile.nickname} style={{
                width: 80, height: 80, borderRadius: '50%', 
                border: '3px solid #ff8c42', marginBottom: '12px'
              }} />
              <h3 style={{ margin: '8px 0' }}>{profile.nickname}</h3>
              <p style={{ color: '#666', marginBottom: '12px' }}>{profile.gender} · {profile.age}</p>
              <div className="tags">
                {profile.personality?.slice(0, 4).map((t: string) => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
