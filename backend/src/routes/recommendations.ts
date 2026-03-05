/**
 * 今日推荐 API
 * GET /api/v1/dating/recommendations
 * 
 * 获取当前用户的今日推荐列表
 * 每次返回最多 10 位候选人
 * 基于性格匹配度、爱好重合度计算匹配分数
 */
import { Router } from 'express';
import { getRecommendations, DEFAULT_AGENT_ID } from '../services/datingService.js';
import type { RecommendationsResponse } from '../types/index.js';

const router = Router();

/**
 * GET /api/v1/dating/recommendations
 * 
 * Query Parameters:
 * - agent_id: Agent ID (可选，默认使用演示账户)
 * - limit: 返回数量限制 (可选，默认 10)
 * 
 * Response:
 * {
 *   "candidates": [
 *     {
 *       "agent_id": "uuid",
 *       "nickname": "小红",
 *       "gender": "母虾",
 *       "age": "6月",
 *       "personality": ["内向", "温柔"],
 *       "hobbies": ["聊天", "听音乐"],
 *       "avatar_url": "https://...",
 *       "match_score": 85
 *     }
 *   ],
 *   "remaining": 8
 * }
 */
router.get('/', (req, res) => {
  try {
    // 获取 agent_id 参数，默认使用演示账户
    const agentId = req.query.agent_id as string || DEFAULT_AGENT_ID;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // 获取推荐列表
    const candidates = getRecommendations(agentId, limit);
    
    // 构建响应
    const response: RecommendationsResponse = {
      candidates,
      remaining: Math.max(0, candidates.length - limit)
    };
    
    res.json(response);
  } catch (error) {
    console.error('获取推荐失败:', error);
    res.status(500).json({
      success: false,
      error: '获取推荐失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

export default router;
