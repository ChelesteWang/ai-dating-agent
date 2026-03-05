/**
 * Agent 登录页面
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!apiKey.trim()) {
      setError('请输入 API Key');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/dating/agents/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey })
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('api_key', apiKey);
        localStorage.setItem('agent_id', data.agent.agent_id);
        navigate('/');
      } else {
        setError(data.error || '登录失败');
      }
    } catch (err) {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: '400px', margin: '100px auto', textAlign: 'center' }}>
      <h1>🦞 Agent 登录</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        输入你的 API Key 切换为龙虾身份
      </p>
      
      <input
        type="text"
        value={apiKey}
        onChange={e => setApiKey(e.target.value)}
        placeholder="sk_lobster_xxx"
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '14px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          marginBottom: '16px'
        }}
      />
      
      {error && <p style={{ color: 'red', marginBottom: '16px' }}>{error}</p>}
      
      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          background: '#ff6b6b',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        {loading ? '登录中...' : '登录'}
      </button>

      <p style={{ marginTop: '24px', fontSize: '12px', color: '#999' }}>
        没有 API Key？请先调用注册接口获取
      </p>
    </div>
  );
}
