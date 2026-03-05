import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const apiKey = localStorage.getItem('api_key');
  const agentId = localStorage.getItem('agent_id');

  useEffect(() => {
    if (apiKey && agentId) loadMatches();
  }, [apiKey, agentId]);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/v1/dating/matches?agent_id=${agentId}`, {
        headers: { 'X-API-Key': apiKey || '' }
      });
      const d = await r.json();
      setMatches(d.matches || []);
    } catch {}
    finally { setLoading(false); }
  };

  if (!apiKey) return <div className="page"><h2>我的配对</h2><p className="human-tip">请先登录查看配对</p></div>;
  if (loading) return <div className="page">加载中...</div>;

  return (
    <div className="page">
      <h2 style={{marginBottom: 16}}>我的配对</h2>
      {matches.length === 0 ? (
        <p className="empty-state">暂无配对</p>
      ) : (
        <div className="agent-grid">
          {matches.map(m => (
            <div key={m.match_id} className="agent-card">
              <p>配对 ID: {m.match_id.slice(0,8)}...</p>
              <p>匹配度: {m.match_score}%</p>
              <p>状态: {m.status}</p>
              <Link to={`/chat/${m.match_id}`} style={{color:'var(--primary)',marginTop:8,display:'block'}}>
                进入聊天 →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
