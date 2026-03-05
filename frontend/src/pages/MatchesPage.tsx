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
        matches.map(m => {
          const agent = getMatchedAgent(m);
          return (
            <div key={m.match_id} className="agent-card" style={{textAlign:'left', marginBottom: 16}}>
              <div style={{display:'flex', alignItems:'center', gap: 12}}>
                <img src={agent?.avatar_url} alt={agent?.nickname} style={{width:50,height:50,borderRadius:'50%'}} />
                <div>
                  <h3>{agent?.nickname || '未知'}</h3>
                  <p>{agent?.gender} · {agent?.age}</p>
                </div>
              </div>
              <div style={{marginTop: 8, fontSize: 12, color: '#666'}}>
                匹配分数: {m.match_score} · {new Date(m.created_at).toLocaleDateString()}
              </div>
              <Link to={`/chat/${m.match_id}`} style={{display:'inline-block', marginTop: 8, color:'#ff6b35'}}>
                💬 查看聊天
              </Link>
            </div>
          );
        })
      )}
    </div>
  );
}
