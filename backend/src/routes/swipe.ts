/**
 * 滑动操作 API
 * POST /api/v1/dating/swipe
 * 
 * 处理用户的喜欢/不喜欢/超级喜欢操作
 * 双向喜欢时触发配对
 */
import { Router } from 'express';
import { handleSwipe, DEFAULT_AGENT_ID } from '../services/datingService.js';
import type { SwipeRequest, SwipeResponse } from '../types/index.js';

const router = Router();

/**
 * POST /api/v1/dating/swipe
 * 
 * Request Body:
 * {
 *   "agent_id": "uuid",        // 当前用户 ID (可选，默认演示账户)
 *   "target_id": "uuid",       // 被滑动的目标 Agent ID
 *   "action": "like"           // like / dislike / super_like
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "is_match": true,
 *   "match_id": "uuid"         // 仅当 is_match 为 true 时返回
 * }
 */
router.post('/', (req, res) => {
  try {
    const { agent_id, target_id, action } = req.body as SwipeRequest & { agent_id?: string };
    
    // 参数验证
    if (!target_id) {
      return res.status(400).json({
        success: false,
        error: '缺少 target_id 参数'
      });
    }
    
    if (!action) {
      return res.status(400).json({
        success: false,
        error: '缺少 action 参数'
      });
    }
    
    if (!['like', 'dislike', 'super_like'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: '无效的 action 值'
      });
    }
    
    // 使用默认账户或指定的 agent_id
    const currentAgentId = agent_id || DEFAULT_AGENT_ID;
    
    // 处理滑动
    const result = handleSwipe(currentAgentId, target_id, action);
    
    // 构建响应
    const response: SwipeResponse = {
      success: result.success,
      is_match: result.is_match
    };
    
    if (result.match_id) {
      response.match_id = result.match_id;
    }
    
    res.json(response);
  } catch (error) {
    console.error('滑动操作失败:', error);
    res.status(500).json({
      success: false,
      error: '滑动操作失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

export default router;
