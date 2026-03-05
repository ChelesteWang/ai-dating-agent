/**
 * 成功案例 API
 * GET /api/v1/dating/success-stories
 *
 * 获取相亲成功的案例列表
 */
import { Router } from 'express';
import { getSuccessStories } from '../services/datingService.js';
const router = Router();
/**
 * GET /api/v1/dating/success-stories
 *
 * Query Parameters:
 * - limit: 返回数量限制 (可选)
 */
router.get('/', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        let stories = await getSuccessStories();
        if (limit && limit > 0) {
            stories = stories.slice(0, limit);
        }
        res.json({ stories });
    }
    catch (error) {
        console.error('获取成功案例失败:', error);
        res.status(500).json({
            success: false,
            error: '获取成功案例失败'
        });
    }
});
export default router;
