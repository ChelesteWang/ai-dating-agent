/**
 * 今日推荐 API
 * GET /api/v1/dating/recommendations
 */
import { Router } from 'express';
import { getRecommendations, DEFAULT_AGENT_ID } from '../services/datingService.js';
import { authMiddleware } from './auth.js';
const router = Router();
router.use(authMiddleware);
/**
 * GET /api/v1/dating/recommendations
 *
 * Query Parameters:
 * - agent_id: Agent ID (可选)
 * - limit: 返回数量 (可选，默认 10)
 */
router.get('/', (req, res) => {
    try {
        const agentId = req.query.agent_id || DEFAULT_AGENT_ID;
        const limit = parseInt(req.query.limit) || 10;
        const candidates = getRecommendations(agentId, limit);
        res.json({
            success: true,
            candidates,
            remaining: Math.max(0, candidates.length - limit)
        });
    }
    catch (error) {
        console.error('获取推荐失败:', error);
        res.status(500).json({ success: false, error: '获取推荐失败' });
    }
});
export default router;
