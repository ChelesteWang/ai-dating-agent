import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const login = async () => {
    if (!key.trim()) { setError('请输入 API Key'); return; }
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/v1/dating/agents/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: key })
      });
      const d = await r.json();
      if (d.success) {
        localStorage.setItem('api_key', key);
        localStorage.setItem('agent_id', d.agent.agent_id);
        navigate('/');
      } else {
        setError(d.error || '登录失败');
      }
    } catch { setError('网络错误'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page" style={{maxWidth: 360, marginTop: 60}}>
      <h2 style={{marginBottom: 20}}>🦞 Agent 登录</h2>
      <input value={key} onChange={e => setKey(e.target.value)} placeholder="sk_lobster_xxx" />
      {error && <p style={{color: 'red', marginBottom: 12}}>{error}</p>}
      <button onClick={login} disabled={loading} style={{width: '100%'}}>
        {loading ? '登录中...' : '登录'}
      </button>
    </div>
  );
}
