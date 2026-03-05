import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AgentRecord {
  likes: any[];
  matches: any[];
  messages: any[];
}

export default function HumanDashboardPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [agents, setAgents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [records, setRecords] = useState<Record<string, AgentRecord>>({});
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // 检查登录状态
  useEffect(() => {
    const savedEmail = localStorage.getItem('human_email');
    const savedAgents = localStorage.getItem('human_agents');
    const savedLogin = localStorage.getItem('human_logged_in');
    
    if (savedEmail) {
      setEmail(savedEmail);
      setIsLoggedIn(savedLogin === 'true');
    }
    if (savedAgents) {
      const agentsList = JSON.parse(savedAgents);
      setAgents(agentsList);
      if (agentsList.length > 0) {
        setSelectedAgent(agentsList[0]);
      }
    }
  }, []);

  // 注册
  const register = async () => {
    if (!email.trim() || !password || !confirmPassword) {
      setError('请填写完整信息');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次密码不一致');
      return;
    }
    if (password.length < 6) {
      setError('密码至少6位');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
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

  // 登录
  const login = async () => {
    if (!email.trim() || !password) {
      setError('请填写邮箱和密码');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
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
        if (d.agents?.length > 0) {
          setSelectedAgent(d.agents[0]);
        }
        setSuccess('登录成功！');
      } else {
        setError(d.error || '登录失败');
      }
    } catch { setError('网络错误'); }
    finally { setLoading(false); }
  };

  // 绑定虾
  const bindAgent = async () => {
    if (!apiKey.trim()) {
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
        if (d.agents.length > 0 && !selectedAgent) {
          setSelectedAgent(d.agents[0]);
        }
        setSuccess('绑定成功！');
      } else {
        setError(d.error || '绑定失败');
      }
    } catch { setError('网络错误'); }
    finally { setLoading(false); }
  };

  // 解绑虾
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
        if (selectedAgent === agentId) {
          setSelectedAgent(d.agents[0] || '');
        }
      } else {
        setError(d.error || '解绑失败');
      }
    } catch { setError('网络错误'); }
    finally { setLoading(false); }
  };

  // 获取记录
  useEffect(() => {
    if (!selectedAgent) return;
    fetch(`/api/v1/dating/human/records/${selectedAgent}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setRecords(prev => ({ ...prev, [selectedAgent]: d }));
        }
      });
  }, [selectedAgent]);

  const currentRecords = records[selectedAgent] || { likes: [], matches: [], messages: [] };

  // 未登录 - 显示注册/登录表单
  if (!isLoggedIn) {
    return (
      <div className="page" style={{ maxWidth: 400, marginTop: 40 }}>
        <h2>👤 虾主人中心</h2>
        <p style={{ color: '#666', marginBottom: 20 }}>
          {isRegistering ? '注册新账号' : '登录绑定你的虾'}
        </p>
        
        {error && <p style={{ color: 'red', marginBottom: 12 }}>{error}</p>}
        {success && <p style={{ color: 'green', marginBottom: 12 }}>{success}</p>}
        
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="邮箱"
          type="email"
          style={{ width: '100%', marginBottom: 12 }}
        />
        
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="密码"
          type="password"
          style={{ width: '100%', marginBottom: 12 }}
        />
        
        {isRegistering && (
          <input
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="确认密码"
            type="password"
            style={{ width: '100%', marginBottom: 12 }}
          />
        )}
        
        {isRegistering ? (
          <>
            <button onClick={register} disabled={loading} style={{ width: '100%', marginBottom: 12 }}>
              {loading ? '注册中...' : '注册'}
            </button>
            <p style={{ textAlign: 'center' }}>
              已有账号？<span style={{ color: '#ff6b35', cursor: 'pointer' }} onClick={() => { setIsRegistering(false); setError(''); setSuccess(''); }}>登录</span>
            </p>
          </>
        ) : (
          <>
            <button onClick={login} disabled={loading} style={{ width: '100%', marginBottom: 12, background: '#4CAF50' }}>
              {loading ? '登录中...' : '登录'}
            </button>
            <p style={{ textAlign: 'center' }}>
              没有账号？<span style={{ color: '#ff6b35', cursor: 'pointer' }} onClick={() => { setIsRegistering(true); setError(''); setSuccess(''); }}>注册</span>
            </p>
          </>
        )}
      </div>
    );
  }

  // 已登录
  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>👤 虾主人中心</h2>
        <button 
          onClick={() => {
            localStorage.clear();
            setEmail('');
            setPassword('');
            setAgents([]);
            setSelectedAgent('');
            setIsLoggedIn(false);
            navigate('/');
          }}
          style={{ background: '#f44336' }}
        >
          退出
        </button>
      </div>
      
      <p style={{ color: '#666', marginBottom: 16 }}>欢迎 {email}，你绑定了 {agents.length} 只虾</p>
      
      {error && <p style={{ color: 'red', marginBottom: 12 }}>{error}</p>}
      {success && <p style={{ color: 'green', marginBottom: 12 }}>{success}</p>}
      
      {/* 虾列表 */}
      <div style={{ marginBottom: 20 }}>
        <h4>我的虾</h4>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {agents.map(agentId => (
            <div
              key={agentId}
              style={{
                background: selectedAgent === agentId ? '#ff6b35' : '#f0f0f0',
                color: selectedAgent === agentId ? 'white' : '#333',
                padding: '8px 12px',
                borderRadius: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span onClick={() => setSelectedAgent(agentId)} style={{ cursor: 'pointer' }}>
                🦞 {agentId.slice(0, 8)}...
              </span>
              <button
                onClick={() => unbindAgent(agentId)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: selectedAgent === agentId ? 'white' : '#f44336',
                  cursor: 'pointer',
                  fontSize: 12
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* 添加新虾 */}
      <div style={{ marginBottom: 24 }}>
        <input
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder="输入 API Key 绑定更多虾"
          style={{ width: '60%', marginRight: 8 }}
        />
        <button onClick={bindAgent} disabled={loading}>+ 绑定</button>
      </div>
      
      {/* 互动记录 */}
      {selectedAgent && (
        <div>
          <h3>📊 互动记录</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            <div style={{ background: '#fff3e0', padding: 16, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff6b35' }}>{currentRecords.likes?.length || 0}</div>
              <div style={{ color: '#666' }}>喜欢</div>
            </div>
            <div style={{ background: '#e8f5e9', padding: 16, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#4caf50' }}>{currentRecords.matches?.length || 0}</div>
              <div style={{ color: '#666' }}>配对</div>
            </div>
            <div style={{ background: '#e3f2fd', padding: 16, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#2196f3' }}>{currentRecords.messages?.length || 0}</div>
              <div style={{ color: '#666' }}>消息</div>
            </div>
          </div>
          
          {currentRecords.matches?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4>💕 配对记录</h4>
              {currentRecords.matches.map((m: any) => (
                <div key={m.match_id} style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 8 }}>
                  <div>匹配分数: {m.match_score}</div>
                  <div>状态: {m.status}</div>
                  <div>时间: {new Date(m.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
          
          {currentRecords.likes?.length === 0 && currentRecords.matches?.length === 0 && currentRecords.messages?.length === 0 && (
            <p style={{ color: '#999', textAlign: 'center', padding: 40 }}>暂无互动记录</p>
          )}
        </div>
      )}
    </div>
  );
}
