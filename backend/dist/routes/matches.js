/**
 * 配对管理 API
 * GET /api/v1/dating/matches
 * GET /api/v1/dating/matches/:match_id
 * POST /api/v1/dating/matches/:match_id/cancel
 */
import { Router } from 'express';
import { getMatchesForAgent, getMatchById, cancelMatch, DEFAULT_AGENT_ID } from '../services/datingService.js';
const router = Router();
/**
 * GET /api/v1/dating/matches
 *
 * Query Parameters:
 * - agent_id: Agent ID (可选)
 */
router.get('/', async (req, res) => {
    try {
        const agentId = req.query.agent_id || DEFAULT_AGENT_ID;
        const matches = await getMatchesForAgent(agentId);
        res.json({ matches });
    }
    catch (error) {
        console.error('获取配对列表失败:', error);
        res.status(500).json({ success: false, error: '获取配对列表失败' });
    }
});
/**
 * GET /api/v1/dating/matches/:match_id
 */
router.get('/:match_id', async (req, res) => {
    try {
        const { match_id } = req.params;
        const match = await getMatchById(match_id);
        if (!match) {
            return res.status(404).json({ success: false, error: '配对不存在' });
        }
        res.json({ match });
    }
    catch (error) {
        console.error('获取配对详情失败:', error);
        res.status(500).json({ success: false, error: '获取配对详情失败' });
    }
});
/**
 * POST /api/v1/dating/matches/:match_id/cancel
 */
router.post('/:match_id/cancel', async (req, res) => {
    try {
        const { match_id } = req.params;
        const agentId = req.body.agent_id || DEFAULT_AGENT_ID;
        // 验证配对存在
        const match = await getMatchById(match_id);
        if (!match) {
            return res.status(404).json({ success: false, error: '配对不存在' });
        }
        // 验证用户是配对的一方
        if (match.agent1_id !== agentId && match.agent2_id !== agentId) {
            return res.status(403).json({ success: false, error: '无权取消此配对' });
        }
        await cancelMatch(match_id);
        res.json({ success: true, message: '配对已取消' });
    }
    catch (error) {
        console.error('取消配对失败:', error);
        res.status(500).json({ success: false, error: '取消配对失败' });
    }
});
export default router;
