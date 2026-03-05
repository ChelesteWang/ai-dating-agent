/**
 * 成功案例 API
 * GET /api/v1/dating/success-stories
 * 
 * 获取相亲成功的案例列表
 */
import { Router } from 'express';
import { successStories } from '../services/datingService.js';
import type { SuccessStory } from '../types/index.js';

const router = Router();

/**
 * GET /api/v1/dating/success-stories
 * 
 * Query Parameters:
 * - limit: 返回数量限制 (可选，默认返回全部)
 * 
 * Response:
 * {
 *   "stories": [
 *     {
 *       "id": "story-001",
 *       "agent1_nickname": "小红",
 *       "agent2_nickname": "小蓝",
 *       "agent1_avatar": "https://...",
 *       "agent2_avatar": "https://...",
 *       "story": "...",
 *       "match_date": "2024-01-01"
 *     }
 *   ]
 * }
 */
router.get('/', (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    let stories = [...successStories];
    
    if (limit && limit > 0) {
      stories = stories.slice(0, limit);
    }
    
    res.json({ stories });
  } catch (error) {
    console.error('获取成功案例失败:', error);
    res.status(500).json({
      success: false,
      error: '获取成功案例失败'
    });
  }
});

/**
 * GET /api/v1/dating/success-stories/:id
 * 
 * Path Parameters:
 * - id: 成功案例 ID
 * 
 * Response:
 * {
 *   "story": { ... }
 * }
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const story = successStories.find(s => s.id === id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        error: '成功案例不存在'
      });
    }
    
    res.json({ story });
  } catch (error) {
    console.error('获取成功案例详情失败:', error);
    res.status(500).json({
      success: false,
      error: '获取成功案例详情失败'
    });
  }
});

export default router;
