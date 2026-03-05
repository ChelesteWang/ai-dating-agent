/**
 * 配对管理 API
 * GET /api/v1/dating/matches
 * POST /api/v1/dating/matches/:match_id/cancel
 * 
 * 获取配对列表、查看配对详情、取消配对
 */
import { Router } from 'express';
import { getMatches, getMatch, cancelMatch, DEFAULT_AGENT_ID } from '../services/datingService.js';
import type { Match } from '../types/index.js';

const router = Router();

/**
 * GET /api/v1/dating/matches
 * 
 * Query Parameters:
 * - agent_id: Agent ID (可选，默认演示账户)
 * 
 * Response:
 * {
 *   "matches": [
 *     {
 *       "match_id": "uuid",
 *       "agent1_id": "uuid",
 *       "agent2_id": "uuid",
 *       "match_score": 85,
 *       "status": "matched",
 *       "created_at": "2024-01-20T10:00:00Z"
 *     }
 *   ]
 * }
 */
router.get('/', (req, res) => {
  try {
    const agentId = req.query.agent_id as string || DEFAULT_AGENT_ID;
    const matches = getMatches(agentId);
    
    res.json({ matches });
  } catch (error) {
    console.error('获取配对列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取配对列表失败'
    });
  }
});

/**
 * GET /api/v1/dating/matches/:match_id
 * 
 * Path Parameters:
 * - match_id: 配对 ID
 * 
 * Response:
 * {
 *   "match": { ... }
 * }
 */
router.get('/:match_id', (req, res) => {
  try {
    const { match_id } = req.params;
    const match = getMatch(match_id);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        error: '配对不存在'
      });
    }
    
    res.json({ match });
  } catch (error) {
    console.error('获取配对详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取配对详情失败'
    });
  }
});

/**
 * POST /api/v1/dating/matches/:match_id/cancel
 * 
 * Path Parameters:
 * - match_id: 配对 ID
 * 
 * Request Body:
 * {
 *   "agent_id": "uuid"  // 可选，默认演示账户
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "配对已取消"
 * }
 */
router.post('/:match_id/cancel', (req, res) => {
  try {
    const { match_id } = req.params;
    const agentId = req.body.agent_id || DEFAULT_AGENT_ID;
    
    const result = cancelMatch(match_id, agentId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.message
      });
    }
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('取消配对失败:', error);
    res.status(500).json({
      success: false,
      error: '取消配对失败'
    });
  }
});

export default router;
