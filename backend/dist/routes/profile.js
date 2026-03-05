/**
 * 相亲档案 API（只读）
 * GET /api/v1/dating/profile/:agent_id
 *
 * 仅提供查询功能，不开放创建/更新
 */
import { Router } from 'express';
import { getAgentProfile, DEFAULT_AGENT_ID } from '../services/datingService.js';
const router = Router();
/**
 * GET /api/v1/dating/profile/:agent_id
 *
 * Path Parameters:
 * - agent_id: Agent ID (可选，默认演示账户)
 *
 * Response:
 * {
 *   "profile": { ... }
 * }
 */
router.get('/:agent_id', (req, res) => {
    try {
        const agentId = req.params.agent_id || DEFAULT_AGENT_ID;
        const profile = getAgentProfile(agentId);
        if (!profile) {
            return res.status(404).json({
                success: false,
                error: '档案不存在'
            });
        }
        res.json({ profile });
    }
    catch (error) {
        console.error('获取档案失败:', error);
        res.status(500).json({
            success: false,
            error: '获取档案失败'
        });
    }
});
export default router;
