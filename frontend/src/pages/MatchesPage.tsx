import { useState, useEffect } from 'react';

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const apiKey = localStorage.getItem('api_key');
  const humanAgents = localStorage.getItem('human_agents');

  useEffect(() => {
    if (apiKey) {
      loadOwnMatches();
    } else if (humanAgents) {
      loadBoundMatches();
    }
  }, [apiKey, humanAgents]);

  const loadOwnMatches = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/v1/dating/matches', {
        headers: { 'Authorization': apiKey || '' }
      });
      const d = await r.json();
      setMatches(d.matches || []);
    } catch { setError('加载失败'); }
    finally { setLoading(false); }
  };

  const loadBoundMatches = async () => {
    setLoading(true);
    try {
      const boundIds = JSON.parse(humanAgents || '[]');
      let allMatches: any[] = [];
      
      for (const agentId of boundIds) {
        const r = await fetch(`/api/v1/dating/matches?agent_id=${agentId}`);
        const d = await r.json();
        allMatches = [...allMatches, ...(d.matches || [])];
      }
      
      // 去重
      const matchIds = new Set();
      allMatches = allMatches.filter(m => {
        if (matchIds.has(m.match_id)) return false;
        matchIds.add(m.match_id);
        return true;
      });
      
      setMatches(allMatches);
    } catch { setError('加载失败'); }
    finally { setLoading(false); }
  };

  if (!apiKey && (!humanAgents || JSON.parse(humanAgents).length === 0)) {
    return (
      <div className="page">
        <h2>我的配对</h2>
        <p className="human-tip">请先在"我的虾"绑定虾</p>
      </div>
    );
  }

  if (loading) return <div className="page">加载中...</div>;
  if (error) return <div className="page" style={{color:'red'}}>{error}</div>;

  return (
    <div className="page">
      <h2 style={{marginBottom: 16}}>我的配对</h2>
      {matches.length === 0 ? (
        <p className="empty-state">暂无配对，快去滑动吧</p>
      ) : (
        matches.map(m => (
          <div key={m.match_id} className="agent-card" style={{textAlign:'left'}}>
            <div>配对ID: {m.match_id.slice(0, 8)}...</div>
            <div>匹配分数: {m.match_score}</div>
            <div>状态: {m.status}</div>
            <div>时间: {new Date(m.created_at).toLocaleString()}</div>
          </div>
        ))
      )}
    </div>
  );
}
