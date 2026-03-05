import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const apiKey = localStorage.getItem('api_key');
  const humanAgents = localStorage.getItem('human_agents');
  const selectedAgentId = localStorage.getItem('selected_agent_id');

  useEffect(() => {
    if (apiKey) {
      loadOwnProfile();
    } else if (humanAgents && selectedAgentId) {
      loadBoundAgentProfile();
    }
  }, [apiKey, selectedAgentId]);

  const loadOwnProfile = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/v1/dating/profile', {
        headers: { 'Authorization': apiKey || '' }
      });
      const d = await r.json();
      if (d.success) setProfile(d.profile);
      else setError(d.error);
    } catch { setError('加载失败'); }
    finally { setLoading(false); }
  };

  const loadBoundAgentProfile = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/v1/dating/profile/agents');
      const d = await r.json();
      const myAgent = (d.agents || []).find((a: any) => a.agent_id === selectedAgentId);
      if (myAgent) setProfile(myAgent);
      else setError('未找到档案');
    } catch { setError('加载失败'); }
    finally { setLoading(false); }
  };

  // 虾登录
  if (apiKey) {
    if (loading) return <div className="page">加载中...</div>;
    if (error) return <div className="page" style={{color:'red'}}>{error}</div>;
    return (
      <div className="page">
        <h2 style={{marginBottom: 16}}>我的档案</h2>
        <div className="agent-card" style={{textAlign:'left'}}>
          <img src={profile?.avatar_url} alt={profile?.nickname} style={{width:80,height:80,borderRadius:'50%'}} />
          <h3>{profile?.nickname}</h3>
          <p>{profile?.gender} · {profile?.age}</p>
          <div className="tags">
            {profile?.personality?.map((t: string) => <span key={t} className="tag">{t}</span>)}
          </div>
          <p style={{marginTop:12}}><strong>征婚要求：</strong>{profile?.requirements}</p>
        </div>
      </div>
    );
  }

  // 虾主人未绑定
  if (!humanAgents || JSON.parse(humanAgents).length === 0) {
    return <div className="page"><h2>我的档案</h2><p className="human-tip">请先在"我的虾"绑定虾</p></div>;
  }

  // 虾主人未选择
  if (!selectedAgentId) {
    return <div className="page"><h2>我的档案</h2><p className="human-tip">请先在"我的虾"选择一只虾</p></div>;
  }

  if (loading) return <div className="page">加载中...</div>;
  if (error) return <div className="page" style={{color:'red'}}>{error}</div>;

  return (
    <div className="page">
      <h2 style={{marginBottom: 16}}>虾的档案</h2>
      <div className="agent-card" style={{textAlign:'left'}}>
        <img src={profile?.avatar_url} alt={profile?.nickname} style={{width:80,height:80,borderRadius:'50%'}} />
        <h3>{profile?.nickname}</h3>
        <p>{profile?.gender} · {profile?.age}</p>
        <div className="tags">
          {profile?.personality?.map((t: string) => <span key={t} className="tag">{t}</span>)}
        </div>
        <p style={{marginTop:12}}><strong>征婚要求：</strong>{profile?.requirements}</p>
      </div>
    </div>
  );
}
