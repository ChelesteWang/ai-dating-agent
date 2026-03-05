/**
 * 滑动操作 API
 * POST /api/v1/dating/swipe
 */
import { Router } from 'express';
import { 
  recordSwipe, 
  hasSwiped,
  getAgentById,
  createMatch,
  calculateMatchScore,
  DEFAULT_AGENT_ID 
} from '../services/datingService.js';

const router = Router();

/**
 * POST /api/v1/dating/swipe
 * 
 * 执行滑动操作
 * 
 * Request Body:
 * {
 *   "agent_id": "uuid",        // 操作者 Agent ID
 *   "target_id": "uuid",       // 目标 Agent ID
 *   "action": "like"           // 滑动类型: like | dislike | super_like
 * }
 */
router.post('/', async (req, res) => {
  try {
    const { agent_id, target_id, action } = req.body;
    
    // 参数验证
    if (!target_id || !action) {
      return res.status(400).json({ 
        success: false, 
        error: 'target_id 和 action 不能为空' 
      });
    }
    
    const swiperId = agent_id || DEFAULT_AGENT_ID;
    
    // 验证 action
    if (!['like', 'dislike', 'super_like'].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        error: 'action 必须是 like, dislike 或 super_like' 
      });
    }
    
    // 检查是否已滑动
    const alreadySwiped = await hasSwiped(swiperId, target_id);
    if (alreadySwiped) {
      return res.status(400).json({ 
        success: false, 
        error: '已经对该用户进行过滑动' 
      });
    }
    
    // 记录滑动
    await recordSwipe(swiperId, target_id, action);
    
    // 如果是 dislike，直接返回
    if (action === 'dislike') {
      return res.json({ 
        success: true, 
        is_match: false,
        message: '已跳过' 
      });
    }
    
    // 检查是否双向喜欢（配对）
    const targetSwipedLike = await hasSwiped(target_id, swiperId);
    let isMatch = false;
    let matchId = undefined;
    
    if (targetSwipedLike) {
      // 检查目标是否喜欢当前用户
      const swiperAgent = await getAgentById(swiperId);
      const targetAgent = await getAgentById(target_id);
      
      if (swiperAgent && targetAgent) {
        // 计算匹配分数
        const matchScore = calculateMatchScore(swiperAgent, targetAgent);
        
        // 创建配对
        const match = await createMatch(swiperId, target_id, matchScore);
        isMatch = true;
        matchId = match.match_id;
      }
    }
    
    res.json({ 
      success: true, 
      is_match: isMatch,
      match_id: matchId 
    });
  } catch (error) {
    console.error('滑动操作失败:', error);
    res.status(500).json({ 
      success: false, 
      error: '滑动操作失败' 
    });
  }
});

export default router;
