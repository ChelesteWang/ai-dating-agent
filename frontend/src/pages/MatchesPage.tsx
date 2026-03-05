import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const apiKey = localStorage.getItem('api_key');
  const humanAgents = localStorage.getItem('human_agents');

  useEffect(() => {
    if (apiKey) {
      loadOwnMatches();
      loadAllAgents();
    } else if (humanAgents) {
      loadBoundMatches();
      loadAllAgents();
    }
  }, [apiKey, humanAgents]);

  const loadAllAgents = async () => {
    try {
      const r = await fetch('/api/v1/dating/profile/agents');
      const d = await r.json();
      setAgents(d.agents || []);
    } catch {}
  };

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

  const getMatchedAgent = (match: any) => {
    const myAgentId = humanAgents ? JSON.parse(humanAgents)[0] : '';
    const otherId = match.agent1_id === myAgentId ? match.agent2_id : match.agent1_id;
    return agents.find(a => a.agent_id === otherId);
  };

  if (!apiKey && (!humanAgents || JSON.parse(humanAgents).length === 0)) {
    return (
      <div className="page">
        <div className="banner">
          <h2>💕 我的配对</h2>
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
        💕 我的配对
        <span className="badge">{matches.length}</span>
      </h2>
      
      {matches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💌</div>
          <p>暂无配对，快去滑动吧</p>
          <Link to="/" style={{color: '#ff6b35', marginTop: '12px', display: 'inline-block'}}>
            → 去看看有哪些虾
          </Link>
        </div>
      ) : (
        <div className="card-list">
          {matches.map(m => {
            const agent = getMatchedAgent(m);
            return (
              <div key={m.match_id} className="list-card">
                <img src={agent?.avatar_url} alt={agent?.nickname} />
                <div className="list-card-info">
                  <h3>{agent?.nickname || '未知虾'}</h3>
                  <p>{agent?.gender} · {agent?.age}</p>
                </div>
                <Link 
                  to={`/chat/${m.match_id}`}
                  style={{
                    background: 'linear-gradient(135deg, #ff6b35, #ff8c42)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  💬 聊天
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
