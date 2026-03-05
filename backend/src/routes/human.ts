import { Router } from 'express';
import { db } from '../db.js';
import crypto from 'crypto';

const router = Router();

const ADMIN_TOKEN = '7710f7e5e47d99938f0521465aa7632f:49f5dc995116a8f04c5688f1cd941755:41d71cb9764e373da1df5c0421d9f7cf6723ee73a2af0005e489d401df3f7e603ff3fa63d845892319fde2f469fe10e1c40830fa';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// 验证 api_key（使用超管接口）
async function validateApiKey(apiKey: string): Promise<{ valid: boolean; agentId?: string; nickname?: string }> {
  try {
    const resp = await fetch('https://6yx34847tr.coze.site/api/v1/dating/admin/agents-with-key', {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    const data = await resp.json();
    if (!data.success) return { valid: false };
    
    for (const agent of data.agents || []) {
      // 解密 api_key 比对
      const decryptResp = await fetch('https://6yx34847tr.coze.site/api/v1/dating/admin/decrypt-key', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ encrypted_key: agent.api_key })
      });
      const decryptData = await decryptResp.json();
      if (decryptData.success && decryptData.api_key === apiKey) {
        return { valid: true, agentId: agent.agent_id, nickname: agent.nickname };
      }
    }
    return { valid: false };
  } catch {
    return { valid: false };
  }
}

router.post('/register', async (req, res) => {
  const { email, password, confirm_password } = req.body;
  
  if (!email || !password || password !== confirm_password) {
    return res.json({ success: false, error: '参数错误' });
  }
  
  const passwordHash = hashPassword(password);
  
  try {
    const { error } = await db
      .from('human_users')
      .upsert({ email, password_hash: passwordHash, agent_ids: [] }, { onConflict: 'email' });
    
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
    
    if (error || !data) {
      return res.json({ success: false, error: '用户不存在' });
    }
    
    if (data.password_hash !== passwordHash) {
      return res.json({ success: false, error: '密码错误' });
    }
    
    return res.json({ success: true, email, agents: data.agent_ids || [] });
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
    // 验证 api_key
    const validation = await validateApiKey(api_key);
    if (!validation.valid) {
      return res.json({ success: false, error: 'API Key无效' });
    }
    
    const { agentId, nickname } = validation;
    
    // 检查是否已被绑定
    const { data: allUsers } = await db.from('human_users').select('email, agent_ids');
    for (const u of allUsers || []) {
      if (u.agent_ids?.includes(agentId) && u.email !== email) {
        return res.json({ success: false, error: `这只虾已绑定其他主人（${u.email}）` });
      }
    }
    
    // 绑定
    const { data: user } = await db
      .from('human_users')
      .select('agent_ids')
      .eq('email', email)
      .single();
    
    let agentIds = user?.agent_ids || [];
    if (!agentIds.includes(agentId)) {
      agentIds.push(agentId);
      await db.from('human_users').update({ agent_ids: agentIds }).eq('email', email);
    }
    
    return res.json({ success: true, email, agents: agentIds, nickname });
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
    const matchesResp = await fetch(`https://6yx34847tr.coze.site/api/v1/dating/matches?agent_id=${agentId}`);
    const matchesData = await matchesResp.json();
    
    res.json({ success: true, matches: matchesData.matches || [] });
  } catch {
    res.json({ success: false, error: '获取失败' });
  }
});

export default router;
