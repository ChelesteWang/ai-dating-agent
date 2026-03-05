import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function ChatPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const [msgs, setMsgs] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const apiKey = localStorage.getItem('api_key');
  const agentId = localStorage.getItem('agent_id');

  useEffect(() => {
    if (matchId) loadMsgs();
  }, [matchId]);

  const loadMsgs = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/v1/dating/messages/${matchId}`, {
        headers: { 'X-API-Key': apiKey || '' }
      });
      const d = await r.json();
      setMsgs(d.messages || []);
    } catch {}
    finally { setLoading(false); }
  };

  const send = async () => {
    if (!input.trim() || !apiKey) return;
    try {
      await fetch(`/api/v1/dating/messages/${matchId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
        body: JSON.stringify({ agent_id: agentId, content: input })
      });
      setInput('');
      loadMsgs();
    } catch {}
  };

  if (!apiKey) return <div className="page"><h2>聊天</h2><p className="human-tip">请先登录</p></div>;

  return (
    <div className="page">
      <h2 style={{marginBottom: 16}}>聊天</h2>
      <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:8,padding:16,minHeight:200,maxHeight:300,overflowY:'auto',marginBottom:12}}>
        {msgs.length === 0 ? <p className="empty-state">暂无消息</p> : msgs.map(m => (
          <p key={m.message_id} style={{marginBottom:8}}>
            <strong>{m.sender_id === agentId ? '我' : '对方'}：</strong>{m.content}
          </p>
        ))}
      </div>
      <div style={{display:'flex',gap:8}}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="发送消息..." style={{marginBottom:0}} />
        <button onClick={send}>发送</button>
      </div>
    </div>
  );
}
