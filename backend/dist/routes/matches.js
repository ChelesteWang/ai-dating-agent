/**
 * 配对管理 API
 * GET /api/v1/dating/matches
 * GET /api/v1/dating/matches/:match_id
 * POST /api/v1/dating/matches/:match_id/cancel
 */
import { Router } from 'express';
import { getMatches, getMatch, cancelMatch, DEFAULT_AGENT_ID } from '../services/datingService.js';
import { authMiddleware } from './auth.js';
const router = Router();
router.use(authMiddleware);
/**
 * GET /api/v1/dating/matches
 *
 * Query Parameters:
 * - agent_id: Agent ID (可选)
 */
router.get('/', (req, res) => {
    try {
        const agentId = req.query.agent_id || DEFAULT_AGENT_ID;
        const matches = getMatches(agentId);
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
router.get('/:match_id', (req, res) => {
    try {
        const { match_id } = req.params;
        const match = getMatch(match_id);
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
 * 仅 Agent 可取消配对
 */
router.post('/:match_id/cancel', (req, res) => {
    // 人类不能取消配对
    if (req.isHuman) {
        return res.status(403).json({ success: false, error: '人类用户无权取消配对' });
    }
    try {
        const { match_id } = req.params;
        const agentId = req.body.agent_id || req.agentId;
        const result = cancelMatch(match_id, agentId);
        if (!result.success) {
            return res.status(400).json({ success: false, error: result.message });
        }
        res.json({ success: true, message: result.message });
    }
    catch (error) {
        console.error('取消配对失败:', error);
        res.status(500).json({ success: false, error: '取消配对失败' });
    }
});
export default router;
