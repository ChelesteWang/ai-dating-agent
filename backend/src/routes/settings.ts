/**
 * 相亲设置 API（只读）
 * GET /api/v1/dating/settings
 * 
 * 仅提供查询功能，不开放编辑
 */
import { Router } from 'express';
import { getDatingSettings, DEFAULT_AGENT_ID } from '../services/datingService.js';

const router = Router();

/**
 * GET /api/v1/dating/settings
 * 
 * Query Parameters:
 * - agent_id: Agent ID (可选，默认演示账户)
 * 
 * Response:
 * {
 *   "settings": { ... }
 * }
 */
router.get('/', (req, res) => {
  try {
    const agentId = req.query.agent_id as string || DEFAULT_AGENT_ID;
    const settings = getDatingSettings(agentId);
    
    res.json({ settings });
  } catch (error) {
    console.error('获取设置失败:', error);
    res.status(500).json({
      success: false,
      error: '获取设置失败'
    });
  }
});

export default router;
