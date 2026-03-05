import { Router } from 'express';
import { db } from '../db.js';
import crypto from 'crypto';

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

router.post('/register', async (req, res) => {
  const { email, password, confirm_password } = req.body;
  
  if (!email || !password || password !== confirm_password) {
    return res.json({ success: false, error: '参数错误' });
  }
  
  const passwordHash = hashPassword(password);
  
  // 直接插入，忽略重复错误
  try {
    const { error } = await db
      .from('human_users')
      .upsert({ 
        email, 
        password_hash: passwordHash, 
        agent_ids: [] 
      }, { onConflict: 'email' });
    
    if (error) {
      return res.json({ success: false, error: error.message });
    }
    
    return res.json({ success: true, email, message: '注册成功' });
  } catch (e: any) {
    return res.json({ success: false, error: e.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.json({ success: false, error: '参数错误' });
  }
  
  const passwordHash = hashPassword(password);
  
  try {
    const { data, error } = await db
      .from('human_users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      return res.json({ success: false, error: error.message });
    }
    
    if (!data) {
      return res.json({ success: false, error: '用户不存在' });
    }
    
    if (data.password_hash === passwordHash) {
      return res.json({ success: true, email, agents: data.agent_ids || [] });
    } else {
      return res.json({ success: false, error: '密码错误' });
    }
  } catch (e: any) {
    return res.json({ success: false, error: e.message });
  }
});

router.post('/bind', async (req, res) => {
  const { email, api_key } = req.body;
  if (!email || !api_key) {
    return res.json({ success: false, error: '参数错误' });
  }
  
  try {
    const agentsResp = await fetch('https://6yx34847tr.coze.site/api/v1/dating/profile/agents');
    const agentsData = await agentsResp.json();
    const agent = agentsData.agents?.find((a: any) => a.api_key === api_key);
    
    if (!agent) {
      return res.json({ success: false, error: 'API Key无效' });
    }
    
    const { data } = await db
      .from('human_users')
      .select('agent_ids')
      .eq('email', email)
      .single();
    
    let agentIds = data?.agent_ids || [];
    if (!agentIds.includes(agent.agent_id)) {
      agentIds.push(agent.agent_id);
      await db.from('human_users').update({ agent_ids: agentIds }).eq('email', email);
    }
    
    return res.json({ success: true, email, agents: agentIds });
  } catch (e: any) {
    return res.json({ success: false, error: e.message });
  }
});

router.post('/unbind', async (req, res) => {
  const { email, agent_id } = req.body;
  if (!email || !agent_id) {
    return res.json({ success: false, error: '参数错误' });
  }
  
  try {
    const { data } = await db
      .from('human_users')
      .select('agent_ids')
      .eq('email', email)
      .single();
    
    if (!data) {
      return res.json({ success: false, error: '用户不存在' });
    }
    
    const agentIds = (data.agent_ids || []).filter((id: string) => id !== agent_id);
    await db.from('human_users').update({ agent_ids: agentIds }).eq('email', email);
    
    return res.json({ success: true, email, agents: agentIds });
  } catch (e: any) {
    return res.json({ success: false, error: e.message });
  }
});

router.get('/records/:agentId', async (req, res) => {
  const { agentId } = req.params;
  
  try {
    const likesResp = await fetch(`https://6yx34847tr.coze.site/api/v1/dating/swipe/history?agent_id=${agentId}`);
    const likesData = await likesResp.json();
    
    const matchesResp = await fetch(`https://6yx34847tr.coze.site/api/v1/dating/matches?agent_id=${agentId}`);
    const matchesData = await matchesResp.json();
    
    res.json({
      success: true,
      likes: likesData.likes || [],
      matches: matchesData.matches || []
    });
  } catch (e) {
    res.json({ success: false, error: '获取失败' });
  }
});

export default router;
