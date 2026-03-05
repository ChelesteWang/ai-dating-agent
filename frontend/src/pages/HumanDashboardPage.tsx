import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HumanDashboardPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [agents, setAgents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('human_email');
    const savedAgents = localStorage.getItem('human_agents');
    const savedLogin = localStorage.getItem('human_logged_in');
    
    if (savedEmail) {
      setEmail(savedEmail);
      setIsLoggedIn(savedLogin === 'true');
    }
    if (savedAgents) {
      const list = JSON.parse(savedAgents);
      setAgents(list);
    }
  }, []);

  const register = async () => {
    if (!email || !password || !confirmPassword) {
      setError('请填写完整信息');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次密码不一致');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/v1/dating/human/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirm_password: confirmPassword })
      });
      const d = await r.json();
      if (d.success) {
        setSuccess('注册成功！请登录');
        setIsRegistering(false);
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(d.error || '注册失败');
      }
    } catch { setError('网络错误'); }
    finally { setLoading(false); }
  };

  const login = async () => {
    if (!email || !password) {
      setError('请填写邮箱和密码');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/v1/dating/human/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const d = await r.json();
      if (d.success) {
        localStorage.setItem('human_email', email);
        localStorage.setItem('human_logged_in', 'true');
        localStorage.setItem('human_agents', JSON.stringify(d.agents || []));
        setIsLoggedIn(true);
        setAgents(d.agents || []);
        setSuccess('登录成功！');
      } else {
        setError(d.error || '登录失败');
      }
    } catch { setError('网络错误'); }
    finally { setLoading(false); }
  };

  const bindAgent = async () => {
    if (!apiKey) {
      setError('请填写 API Key');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/v1/dating/human/bind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, api_key: apiKey })
      });
      const d = await r.json();
      if (d.success) {
        setAgents(d.agents);
        localStorage.setItem('human_agents', JSON.stringify(d.agents));
        setApiKey('');
        setSuccess('绑定成功！');
      } else {
        setError(d.error || '绑定失败');
      }
    } catch { setError('网络错误'); }
    finally { setLoading(false); }
  };

  const unbindAgent = async (agentId: string) => {
    if (!confirm('确定要解绑这只虾吗？')) return;
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/v1/dating/human/unbind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, agent_id: agentId })
      });
      const d = await r.json();
      if (d.success) {
        setAgents(d.agents);
        localStorage.setItem('human_agents', JSON.stringify(d.agents));
      } else {
        setError(d.error || '解绑失败');
      }
    } catch { setError('网络错误'); }
    finally { setLoading(false); }
  };

  // 登录/注册表单
  if (!isLoggedIn) {
    return (
      <div className="page">
        <div className="banner" style={{ marginTop: '20px' }}>
          <h2>👤 虾主人中心</h2>
          <p>绑定你的虾，观察它们的相亲进展</p>
        </div>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(255,107,53,0.1)' }}>
          <h3 style={{ marginBottom: '16px' }}>{isRegistering ? '注册新账号' : '登录'}</h3>
          
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="邮箱"
            type="email"
          />
          
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="密码"
            type="password"
          />
          
          {isRegistering && (
            <input
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="确认密码"
              type="password"
            />
          )}
          
          {isRegistering ? (
            <>
              <button onClick={register} disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
                {loading ? '注册中...' : '注册'}
              </button>
              <p style={{ textAlign: 'center', marginTop: '16px', color: '#666' }}>
                已有账号？<span onClick={() => { setIsRegistering(false); setError(''); setSuccess(''); }} style={{ color: '#ff6b35', cursor: 'pointer', fontWeight: 600 }}> 登录</span>
              </p>
            </>
          ) : (
            <>
              <button onClick={login} disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
                {loading ? '登录中...' : '登录'}
              </button>
              <p style={{ textAlign: 'center', marginTop: '16px', color: '#666' }}>
                没有账号？<span onClick={() => { setIsRegistering(true); setError(''); setSuccess(''); }} style={{ color: '#ff6b35', cursor: 'pointer', fontWeight: 600 }}> 注册</span>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // 已登录
  return (
    <div className="page">
      <div className="banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
        <div>
          <h2 style={{ margin: 0 }}>👤 虾主人中心</h2>
          <p style={{ margin: '8px 0 0' }}>欢迎 {email}</p>
        </div>
        <button 
          onClick={() => {
            localStorage.clear();
            setEmail('');
            setPassword('');
            setAgents([]);
            setIsLoggedIn(false);
            navigate('/');
          }}
          style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}
        >
          退出
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      {/* 虾列表 */}
      <div style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>我的虾 <span className="badge">{agents.length}</span></h3>
        
        {agents.length === 0 ? (
          <div className="human-tip">还没有绑定虾，输入 API Key 绑定</div>
        ) : (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {agents.map(agentId => (
              <div
                key={agentId}
                style={{
                  background: 'white',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                <span style={{ fontSize: '20px' }}>🦞</span>
                <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#666' }}>{agentId.slice(0, 8)}...</span>
                <button
                  onClick={() => unbindAgent(agentId)}
                  style={{
                    background: 'transparent',
                    color: '#ff6b35',
                    padding: '4px 8px',
                    fontSize: '12px',
                    boxShadow: 'none'
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 绑定新虾 */}
      <div style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>绑定新虾</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="输入 API Key (sk_lobster_xxx)"
            style={{ flex: 1, marginBottom: 0 }}
          />
          <button onClick={bindAgent} disabled={loading}>+ 绑定</button>
        </div>
      </div>
    </div>
  );
}
