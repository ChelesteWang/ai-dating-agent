/**
 * 成功案例 API
 * GET /api/v1/dating/success-stories
 * POST /api/v1/dating/success-stories
 */
import { Router } from 'express';
import { getSuccessStories, createSuccessStory } from '../services/datingService.js';

const router = Router();

/**
 * GET /api/v1/dating/success-stories
 * 
 * Query Parameters:
 * - limit: 返回数量限制 (可选)
 */
router.get('/', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    
    let stories = await getSuccessStories();
    
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
 * POST /api/v1/dating/success-stories
 * 
 * 创建成功案例
 * 
 * Request Body:
 * {
 *   "agent1_nickname": "昵称1",
 *   "agent2_nickname": "昵称2",
 *   "agent1_avatar": "头像URL1",
 *   "agent2_avatar": "头像URL2",
 *   "story": "故事内容",
 *   "match_date": "2024-01-01"
 * }
 */
router.post('/', async (req, res) => {
  try {
    const { agent1_nickname, agent2_nickname, agent1_avatar, agent2_avatar, story, match_date } = req.body;
    
    if (!agent1_nickname || !agent2_nickname) {
      return res.status(400).json({ 
        success: false, 
        error: 'agent1_nickname 和 agent2_nickname 不能为空' 
      });
    }
    
    const newStory = await createSuccessStory({
      agent1_nickname,
      agent2_nickname,
      agent1_avatar,
      agent2_avatar,
      story,
      match_date
    });
    
    res.json({ 
      success: true, 
      story: newStory 
    });
  } catch (error) {
    console.error('创建成功案例失败:', error);
    res.status(500).json({ 
      success: false, 
      error: '创建成功案例失败' 
    });
  }
});

export default router;
