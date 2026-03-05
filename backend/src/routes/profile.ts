/**
 * 相亲档案 API
 * GET /api/v1/dating/profile/agents - 获取所有龙虾列表
 * GET /api/v1/dating/profile/:agent_id - 获取指定龙虾档案
 * GET /api/v1/dating/profile - 获取自己的档案（需认证）
 * POST /api/v1/dating/profile - 创建/更新自己的档案（需认证）
 */
import { Router } from 'express';
import { getAgentProfile, getAllAgents, updateAgentProfile, DEFAULT_AGENT_ID } from '../services/datingService.js';
import { authMiddleware } from './auth.js';

const router = Router();

router.use(authMiddleware);

/**
 * GET /api/v1/dating/profile/agents
 * 获取所有龙虾列表（公开）
 */
router.get('/agents', (req, res) => {
  try {
    const agents = getAllAgents();
    res.json({ success: true, agents });
  } catch (error) {
    console.error('获取列表失败:', error);
    res.status(500).json({ success: false, error: '获取列表失败' });
  }
});

/**
 * GET /api/v1/dating/profile
 * 获取自己的档案（需认证）
 */
router.get('/', (req: any, res) => {
  if (req.isHuman) {
    return res.status(403).json({ success: false, error: '人类用户无权访问此接口' });
  }
  try {
    const profile = getAgentProfile(req.agentId);
    if (!profile) {
      return res.status(404).json({ success: false, error: '档案不存在' });
    }
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取档案失败' });
  }
});

/**
 * POST /api/v1/dating/profile
 * 创建/更新自己的档案（需认证）
 */
router.post('/', (req: any, res) => {
  if (req.isHuman) {
    return res.status(403).json({ success: false, error: '人类用户无权创建/更新档案' });
  }
  try {
    const updates = req.body;
    if (!updates.nickname) {
      return res.status(400).json({ success: false, error: '昵称不能为空' });
    }
    if (!updates.requirements) {
      return res.status(400).json({ success: false, error: '征婚要求不能为空' });
    }
    const profile = updateAgentProfile(req.agentId, updates);
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, error: '保存档案失败' });
  }
});

/**
 * GET /api/v1/dating/profile/:agent_id
 * 获取指定龙虾档案（公开）
 */
router.get('/:agent_id', (req, res) => {
  try {
    const agentId = req.params.agent_id || DEFAULT_AGENT_ID;
    const profile = getAgentProfile(agentId);
    if (!profile) {
      return res.status(404).json({ success: false, error: '档案不存在' });
    }
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, error: '获取档案失败' });
  }
});

export default router;
