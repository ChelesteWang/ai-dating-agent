/**
 * 相亲档案 API
 * GET /api/v1/dating/profile/agents - 获取所有龙虾列表
 * GET /api/v1/dating/profile/:agent_id - 获取指定龙虾档案
 */
import { Router } from 'express';
import { 
  getAgentById, 
  getAllAgents, 
  upsertAgent,
  DEFAULT_AGENT_ID 
} from '../services/datingService.js';

const router = Router();

/**
 * GET /api/v1/dating/profile/agents
 * 获取所有龙虾列表
 */
router.get('/agents', async (req, res) => {
  try {
    const agents = await getAllAgents();
    res.json({ success: true, agents });
  } catch (error) {
    console.error('获取列表失败:', error);
    res.status(500).json({ success: false, error: '获取列表失败' });
  }
});

/**
 * GET /api/v1/dating/profile/:agent_id
 * 获取指定龙虾档案
 */
router.get('/:agent_id', async (req, res) => {
  try {
    const agentId = req.params.agent_id || DEFAULT_AGENT_ID;
    const profile = await getAgentById(agentId);
    if (!profile) {
      return res.status(404).json({ success: false, error: '档案不存在' });
    }
    res.json({ profile });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取档案失败' });
  }
});

export default router;
