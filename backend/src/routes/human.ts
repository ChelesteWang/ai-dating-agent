import { Router } from 'express';
import { db, isUsingDatabase } from '../db.js';

const router = Router();

// 内存存储（备用）
const memoryHumanUsers = new Map<string, { email: string; agentIds: string[] }>();

/**
 * 创建人类用户表（如果使用数据库）
 */
async function ensureHumanTable() {
  if (!isUsingDatabase()) return;
  
  // 创建表（如果不存在）
  try {
    await db.from('human_users').select('email').limit(1);
  } catch {
    // 表不存在，需要通过 Supabase console 创建
    console.log('请在 Supabase 创建 human_users 表');
  }
}

/**
 * 人类注册/绑定
 * POST /api/v1/dating/human/register
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
    
    if (isUsingDatabase()) {
      // 数据库模式：查询或创建用户
      let { data: existing } = await db
        .from('human_users')
        .select('*')
        .eq('email', email)
        .single();
      
      let agentIds: string[] = [];
      
      if (existing) {
        agentIds = existing.agent_ids || [];
        if (!agentIds.includes(agent.agent_id)) {
          agentIds.push(agent.agent_id);
          await db
            .from('human_users')
            .update({ agent_ids: agentIds })
            .eq('email', email);
        }
      } else {
        agentIds = [agent.agent_id];
        await db
          .from('human_users')
          .insert({ email, agent_ids: agentIds });
      }
      
      res.json({ success: true, email, agents: agentIds });
    } else {
      // 内存模式
      if (!memoryHumanUsers.has(email)) {
        memoryHumanUsers.set(email, { email, agentIds: [] });
      }
      
      const user = memoryHumanUsers.get(email)!;
      if (!user.agentIds.includes(agent.agent_id)) {
        user.agentIds.push(agent.agent_id);
      }
      
      res.json({ success: true, email, agents: user.agentIds });
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
