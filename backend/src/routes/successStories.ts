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
 *   "match_id": "uuid",
 *   "story": "故事内容",
 *   "agent1_id": "uuid",
 *   "agent2_id": "uuid"
 * }
 */
router.post('/', async (req, res) => {
  try {
    const { match_id, story, agent1_id, agent2_id } = req.body;
    
    if (!match_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'match_id 不能为空' 
      });
    }
    
    const newStory = await createSuccessStory({
      match_id,
      story: story || '两只虾通过龙虾相亲平台相遇相爱！',
      agent1_id,
      agent2_id
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
