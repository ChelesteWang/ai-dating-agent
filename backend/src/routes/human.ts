import { Router } from 'express';

const router = Router();

// 简单内存存储（生产环境应使用数据库）
const humanUsers = new Map<string, { email: string; agentIds: string[] }>();

// 人类注册/绑定
router.post('/register', async (req, res) => {
  const { email, api_key } = req.body;
  
  if (!email || !api_key) {
    return res.json({ success: false, error: '请提供邮箱和 API Key' });
  }
  
  // 验证 api_key 是否有效
  const agentsResp = await fetch('https://6yx34847tr.coze.site/api/v1/dating/profile/agents');
  const agentsData = await agentsResp.json();
  const agent = agentsData.agents?.find((a: any) => a.api_key === api_key);
  
  if (!agent) {
    return res.json({ success: false, error: 'API Key 无效' });
  }
  
  // 绑定或创建用户
  if (!humanUsers.has(email)) {
    humanUsers.set(email, { email, agentIds: [] });
  }
  
  const user = humanUsers.get(email)!;
  if (!user.agentIds.includes(agent.agent_id)) {
    user.agentIds.push(agent.agent_id);
  }
  
  res.json({ success: true, email, agents: user.agentIds });
});

// 人类登录
router.post('/login', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.json({ success: false, error: '请提供邮箱' });
  }
  
  const user = humanUsers.get(email);
  if (!user) {
    return res.json({ success: false, error: '用户不存在，请先绑定' });
  }
  
  res.json({ success: true, email, agents: user.agentIds });
});

// 获取用户的虾的互动记录
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
