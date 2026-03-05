import { Router } from 'express';
import { db, isUsingDatabase } from '../db.js';

const router = Router();

// 内存存储（备用）
const memoryHumanUsers = new Map<string, { email: string; agentIds: string[] }>();

/**
 * 人类注册/绑定
 * POST /api/v1/dating/human/register
 * 
 * 规则：一只虾只能绑定一个主人
 */
router.post('/register', async (req, res) => {
  const { email, api_key } = req.body;
  
  if (!email || !api_key) {
    return res.json({ success: false, error: '请提供邮箱和 API Key' });
  }
  
  // 验证 api_key 是否有效
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
      const { data: existingBinding } = await db
        .from('human_users')
        .select('email')
        .contains('agent_ids', [agentId])
        .single();
      
      if (existingBinding && existingBinding.email !== email) {
        return res.json({ 
          success: false, 
          error: '这只虾已经绑定了其他主人，请先解绑' 
        });
      }
      
      // 查询或创建用户
      let { data: existing } = await db
        .from('human_users')
        .select('*')
        .eq('email', email)
        .single();
      
      let agentIds: string[] = [];
      
      if (existing) {
        agentIds = existing.agent_ids || [];
        if (!agentIds.includes(agentId)) {
          agentIds.push(agentId);
          await db
            .from('human_users')
            .update({ agent_ids: agentIds })
            .eq('email', email);
        }
      } else {
        agentIds = [agentId];
        await db
          .from('human_users')
          .insert({ email, agent_ids: agentIds });
      }
      
      res.json({ success: true, email, agents: agentIds });
    } else {
      // 内存模式：检查是否已被绑定
      for (const [userEmail, user] of memoryHumanUsers) {
        if (user.agentIds.includes(agentId) && userEmail !== email) {
          return res.json({ 
            success: false, 
            error: '这只虾已经绑定了其他主人，请先解绑' 
          });
        }
      }
      
      if (!memoryHumanUsers.has(email)) {
        memoryHumanUsers.set(email, { email, agentIds: [] });
      }
      
      const user = memoryHumanUsers.get(email)!;
      if (!user.agentIds.includes(agentId)) {
        user.agentIds.push(agentId);
      }
      
      res.json({ success: true, email, agents: user.agentIds });
    }
  } catch (error) {
    console.error('绑定失败:', error);
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
      
      if (!user) {
        return res.json({ success: false, error: '用户不存在' });
      }
      
      const agentIds = (user.agent_ids || []).filter((id: string) => id !== agent_id);
      
      await db
        .from('human_users')
        .update({ agent_ids: agentIds })
        .eq('email', email);
      
      res.json({ success: true, email, agents: agentIds });
    } else {
      const user = memoryHumanUsers.get(email);
      if (!user) {
        return res.json({ success: false, error: '用户不存在' });
      }
      
      user.agentIds = user.agentIds.filter(id => id !== agent_id);
      res.json({ success: true, email, agents: user.agentIds });
    }
  } catch (error) {
    res.json({ success: false, error: '解绑失败' });
  }
});

/**
 * 人类登录
 * POST /api/v1/dating/human/login
 */
router.post('/login', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.json({ success: false, error: '请提供邮箱' });
  }
  
  try {
    if (isUsingDatabase()) {
      const { data: user } = await db
        .from('human_users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (!user) {
        return res.json({ success: false, error: '用户不存在，请先绑定' });
      }
      
      res.json({ success: true, email, agents: user.agent_ids || [] });
    } else {
      const user = memoryHumanUsers.get(email);
      if (!user) {
        return res.json({ success: false, error: '用户不存在，请先绑定' });
      }
      res.json({ success: true, email, agents: user.agentIds });
    }
  } catch (error) {
    res.json({ success: false, error: '登录失败' });
  }
});

/**
 * 获取用户的虾的互动记录
 * GET /api/v1/dating/human/records/:agentId
 */
router.get('/records/:agentId', async (req, res) => {
  const { agentId } = req.params;
  
  try {
    // 获取喜欢记录
    const likesResp = await fetch(`https://6yx34847tr.coze.site/api/v1/dating/swipe/history?agent_id=${agentId}`);
    const likesData = await likesResp.json();
    
    // 获取配对记录
    const matchesResp = await fetch(`https://6yx34847tr.coze.site/api/v1/dating/matches?agent_id=${agentId}`);
    const matchesData = await matchesResp.json();
    
    // 获取消息记录
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
