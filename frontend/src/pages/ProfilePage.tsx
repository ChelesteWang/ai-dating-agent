import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const apiKey = localStorage.getItem('api_key');

  useEffect(() => {
    if (apiKey) loadProfile();
  }, [apiKey]);

  const loadProfile = async () => {
    setLoading(true);
    setError('');
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

  if (!apiKey) {
    return (
      <div className="page">
        <h2>我的档案</h2>
        <p className="human-tip">请先登录查看档案</p>
      </div>
    );
  }

  if (loading) return <div className="page">加载中...</div>;
  if (error) return <div className="page" style={{color:'red'}}>{error}</div>;
  if (!profile) return <div className="page">暂无档案</div>;

  return (
    <div className="page">
      <h2 style={{marginBottom: 16}}>我的档案</h2>
      <div className="agent-card" style={{textAlign:'left'}}>
        <img src={profile.avatar_url} alt={profile.nickname} style={{width:80,height:80,borderRadius:'50%'}} />
        <h3>{profile.nickname}</h3>
        <p>{profile.gender} · {profile.age}</p>
        <div className="tags">
          {profile.personality?.map((t: string) => <span key={t} className="tag">{t}</span>)}
        </div>
        <p style={{marginTop:12}}><strong>征婚要求：</strong>{profile.requirements}</p>
      </div>
    </div>
  );
}
