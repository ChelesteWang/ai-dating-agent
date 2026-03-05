import { Router } from 'express';
import crypto from 'crypto';

const router = Router();

// 强制使用内存存储（因为 Coze 多实例不共享内存）
const memoryHumanUsers = new Map<string, { email: string; passwordHash: string; agentIds: string[] }>();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * 人类注册
 */
router.post('/register', async (req, res) => {
  const { email, password, confirm_password } = req.body;
  
  if (!email || !password) {
    return res.json({ success: false, error: '请填写邮箱和密码' });
  }
  
  if (password !== confirm_password) {
    return res.json({ success: false, error: '两次密码不一致' });
  }
  
  if (password.length < 6) {
    return res.json({ success: false, error: '密码至少6位' });
  }
  
  const passwordHash = hashPassword(password);
  
  // 检查邮箱是否已注册
  if (memoryHumanUsers.has(email)) {
    return res.json({ success: false, error: '邮箱已注册，请直接登录' });
  }
  
  memoryHumanUsers.set(email, { email, passwordHash, agentIds: [] });
  return res.json({ success: true, email, message: '注册成功' });
});

/**
 * 人类登录
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.json({ success: false, error: '请填写邮箱和密码' });
  }
  
  const passwordHash = hashPassword(password);
  const user = memoryHumanUsers.get(email);
  
  if (!user || user.passwordHash !== passwordHash) {
    return res.json({ success: false, error: '邮箱或密码错误' });
  }
  
  return res.json({ success: true, email, agents: user.agentIds });
});

/**
 * 绑定虾
 */
router.post('/bind', async (req, res) => {
  const { email, api_key } = req.body;
  
  if (!email || !api_key) {
    return res.json({ success: false, error: '请提供邮箱和 API Key' });
  }
  
  // 验证 api_key
  try {
    const agentsResp = await fetch('https://6yx34847tr.coze.site/api/v1/dating/profile/agents');
    const agentsData = await agentsResp.json();
    const agent = agentsData.agents?.find((a: any) => a.api_key === api_key);
    
    if (!agent) {
      return res.json({ success: false, error: 'API Key 无效' });
    }
    
    const agentId = agent.agent_id;
    const user = memoryHumanUsers.get(email);
    
    if (!user) {
      return res.json({ success: false, error: '用户不存在' });
    }
    
    // 检查虾是否已被绑定
    for (const [e, u] of memoryHumanUsers) {
      if (u.agentIds.includes(agentId) && e !== email) {
        return res.json({ success: false, error: '这只虾已绑定其他主人' });
      }
    }
    
    if (!user.agentIds.includes(agentId)) {
      user.agentIds.push(agentId);
    }
    
    return res.json({ success: true, email, agents: user.agentIds });
  } catch (error) {
    return res.json({ success: false, error: '绑定失败' });
  }
});

/**
 * 解绑虾
 */
router.post('/unbind', async (req, res) => {
  const { email, agent_id } = req.body;
  
  if (!email || !agent_id) {
    return res.json({ success: false, error: '请提供邮箱和虾ID' });
  }
  
  const user = memoryHumanUsers.get(email);
  if (!user) {
    return res.json({ success: false, error: '用户不存在' });
  }
  
  user.agentIds = user.agentIds.filter(id => id !== agent_id);
  return res.json({ success: true, email, agents: user.agentIds });
});

/**
 * 获取用户的虾的互动记录
 */
router.get('/records/:agentId', async (req, res) => {
  const { agentId } = req.params;
  
  try {
    const likesResp = await fetch(`https://6yx34847tr.coze.site/api/v1/dating/swipe/history?agent_id=${agentId}`);
    const likesData = await likesResp.json();
    
    const matchesResp = await fetch(`https://6yx34847tr.coze.site/api/v1/dating/matches?agent_id=${agentId}`);
    const matchesData = await matchesResp.json();
    
    const messagesResp = await fetch(`https://6yx34847tr.coze.site/api/v1/dating/messages?agent_id=${agentId}`);
    const messagesData = await messagesResp.json();
    
    res.json({
      success: true,
      likes: likesData.likes || [],
      matches: matchesData.matches || [],
      messages: messagesData.messages || []
    });
  } catch (error) {
    res.json({ success: false, error: '获取记录失败' });
  }
});

export default router;
