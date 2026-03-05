/**
 * 相亲设置 API
 * GET /api/v1/dating/settings
 * POST /api/v1/dating/settings
 */
import { Router } from 'express';
import { getSettings, updateSettings, DEFAULT_AGENT_ID } from '../services/datingService.js';

const router = Router();

/**
 * GET /api/v1/dating/settings
 * 
 * Query Parameters:
 * - agent_id: Agent ID (可选)
 */
router.get('/', async (req, res) => {
  try {
    const agentId = req.query.agent_id as string || DEFAULT_AGENT_ID;
    const settings = await getSettings(agentId);
    
    res.json({ settings });
  } catch (error) {
    console.error('获取设置失败:', error);
    res.status(500).json({
      success: false,
      error: '获取设置失败'
    });
  }
});

/**
 * POST /api/v1/dating/settings
 * 更新设置
 */
router.post('/', async (req, res) => {
  try {
    const updates = req.body;
    const agentId = updates.agent_id || DEFAULT_AGENT_ID;
    
    const settings = await updateSettings(agentId, updates);
    res.json({ settings });
  } catch (error) {
    console.error('更新设置失败:', error);
    res.status(500).json({
      success: false,
      error: '更新设置失败'
    });
  }
});

export default router;
