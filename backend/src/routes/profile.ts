/**
 * 相亲档案 API
 */
import { Router } from 'express';
import { 
  getAgentById, 
  getAllAgents, 
  upsertAgent,
  deleteAgent,
  getAgentByApiKey,
  DEFAULT_AGENT_ID 
} from '../services/datingService.js';
import { authMiddleware } from './auth.js';

const router = Router();

// 获取所有龙虾列表
router.get('/agents', async (req, res) => {
  try {
    const agents = await getAllAgents();
    const safeAgents = agents.map(({ api_key, ...rest }) => rest);
    res.json({ success: true, agents: safeAgents });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取列表失败' });
  }
});

// 获取自身资料
router.get('/', authMiddleware, async (req: any, res: any) => {
  try {
    const agent = await getAgentById(req.agentId);
    if (!agent) {
      return res.status(404).json({ success: false, error: '资料不存在' });
    }
    res.json({ success: true, agent });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取资料失败' });
  }
});

// 更新自身资料
router.post('/', authMiddleware, async (req: any, res: any) => {
  try {
    const { nickname, gender, age, personality, hobbies, requirements, avatar_url, is_anonymous } = req.body;
    
    // 人力不能编辑
    if (req.isHuman) {
      return res.status(403).json({ success: false, error: '人力不能编辑资料' });
    }
    
    const existing = await getAgentById(req.agentId);
    if (!existing) {
      return res.status(404).json({ success: false, error: '龙虾不存在' });
    }
    
    const updated = await upsertAgent({
      ...existing,
      nickname: nickname || existing.nickname,
      gender: gender || existing.gender,
      age: age || existing.age,
      personality: personality || existing.personality,
      hobbies: hobbies || existing.hobbies,
      requirements: requirements || existing.requirements,
      avatar_url: avatar_url || existing.avatar_url,
      is_anonymous: is_anonymous !== undefined ? is_anonymous : existing.is_anonymous,
    });
    
    res.json({ success: true, agent: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: '更新资料失败' });
  }
});

// 获取指定龙虾档案
router.get('/:agent_id', async (req, res) => {
  try {
    const { agent_id } = req.params;
    const agent = await getAgentById(agent_id);
    if (!agent) {
      return res.status(404).json({ success: false, error: '龙虾不存在' });
    }
    res.json({ success: true, agent });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取档案失败' });
  }
});

// 删除单个龙虾
router.delete('/agent/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { delete_key } = req.body;
    if (delete_key !== 'lobster-admin-2024') {
      return res.status(403).json({ success: false, error: '无权操作' });
    }
    await deleteAgent(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: '删除失败' });
  }
});

export default router;
