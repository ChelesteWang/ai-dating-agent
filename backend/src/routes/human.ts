import { Router } from 'express';
import { db, isUsingDatabase } from '../db.js';
import crypto from 'crypto';

const router = Router();

// 内存存储
const memoryHumanUsers = new Map<string, { email: string; passwordHash: string; agentIds: string[] }>();

// 简单哈希函数
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * 人类注册
 * POST /api/v1/dating/human/register
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
  
  try {
    const passwordHash = hashPassword(password);
    
    if (isUsingDatabase()) {
      // 检查邮箱是否已注册
      const { data: existing } = await db
        .from('human_users')
        .select('email')
        .eq('email', email)
        .single();
      
      if (existing) {
        return res.json({ success: false, error: '邮箱已注册，请直接登录' });
      }
      
      // 创建新用户
      await db
        .from('human_users')
        .insert({ email, password_hash: passwordHash, agent_ids: [] });
      
      res.json({ success: true, email, message: '注册成功' });
    } else {
      if (memoryHumanUsers.has(email)) {
        return res.json({ success: false, error: '邮箱已注册，请直接登录' });
      }
      
      memoryHumanUsers.set(email, { email, passwordHash, agentIds: [] });
      res.json({ success: true, email, message: '注册成功' });
    }
  } catch (error) {
    console.error('注册失败:', error);
    res.json({ success: false, error: '注册失败' });
  }
});

/**
 * 人类登录
 * POST /api/v1/dating/human/login
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.json({ success: false, error: '请填写邮箱和密码' });
  }
  
  try {
    const passwordHash = hashPassword(password);
    
    if (isUsingDatabase()) {
      const { data: user } = await db
        .from('human_users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (!user || user.password_hash !== passwordHash) {
        return res.json({ success: false, error: '邮箱或密码错误' });
      }
      
      res.json({ success: true, email, agents: user.agent_ids || [], logged_in: true });
    } else {
      const user = memoryHumanUsers.get(email);
      if (!user || user.passwordHash !== passwordHash) {
        return res.json({ success: false, error: '邮箱或密码错误' });
      }
      res.json({ success: true, email, agents: user.agentIds });
    }
  } catch (error) {
    res.json({ success: false, error: '登录失败' });
  }
});

/**
 * 绑定虾
 * POST /api/v1/dating/human/bind
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
    
    if (isUsingDatabase()) {
      // 检查这只虾是否已经被绑定
      const { data: allUsers } = await db
        .from('human_users')
        .select('email, agent_ids');
      
      for (const u of allUsers || []) {
        if (u.agent_ids && u.agent_ids.includes(agentId) && u.email !== email) {
          return res.json({ success: false, error: '这只虾已绑定其他主人' });
        }
      }
      
      const { data: user } = await db
        .from('human_users')
        .select('agent_ids')
        .eq('email', email)
        .single();
      
      let agentIds = user?.agent_ids || [];
      if (!agentIds.includes(agentId)) {
        agentIds.push(agentId);
        await db
          .from('human_users')
          .update({ agent_ids: agentIds })
          .eq('email', email);
      }
      
      res.json({ success: true, email, agents: agentIds });
    } else {
      const user = memoryHumanUsers.get(email);
      if (!user) {
        return res.json({ success: false, error: '用户不存在' });
      }
      
      for (const [e, u] of memoryHumanUsers) {
        if (u.agentIds.includes(agentId) && e !== email) {
          return res.json({ success: false, error: '这只虾已绑定其他主人' });
        }
      }
      
      if (!user.agentIds.includes(agentId)) {
        user.agentIds.push(agentId);
      }
      
      res.json({ success: true, email, agents: user.agentIds });
    }
  } catch (error) {
    res.json({ success: false, error: '绑定失败' });
  }
});

/**
 * 解绑虾
 * POST /api/v1/dating/human/unbind
 */
router.post('/unbind', async (req, res) => {
  const { email, agent_id } = req.body;
  
  if (!email || !agent_id) {
    return res.json({ success: false, error: '请提供邮箱和虾ID' });
  }
  
  try {
    if (isUsingDatabase()) {
      const { data: user } = await db
        .from('human_users')
        .select('agent_ids')
        .eq('email', email)
        .single();
      
      if (!user) return res.json({ success: false, error: '用户不存在' });
      
      const agentIds = (user.agent_ids || []).filter((id: string) => id !== agent_id);
      await db
        .from('human_users')
        .update({ agent_ids: agentIds })
        .eq('email', email);
      
      res.json({ success: true, email, agents: agentIds });
    } else {
      const user = memoryHumanUsers.get(email);
      if (!user) return res.json({ success: false, error: '用户不存在' });
      
      user.agentIds = user.agentIds.filter(id => id !== agent_id);
      res.json({ success: true, email, agents: user.agentIds });
    }
  } catch (error) {
    res.json({ success: false, error: '解绑失败' });
  }
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
