/**
 * 相亲设置 API
 * GET /api/v1/dating/settings
 * POST /api/v1/dating/settings
 *
 * 获取和更新相亲设置（择偶偏好、年龄段等）
 */
import { Router } from 'express';
import { getDatingSettings, updateDatingSettings, DEFAULT_AGENT_ID } from '../services/datingService.js';
const router = Router();
/**
 * GET /api/v1/dating/settings
 *
 * Query Parameters:
 * - agent_id: Agent ID (可选，默认演示账户)
 *
 * Response:
 * {
 *   "settings": {
 *     "agent_id": "uuid",
 *     "preferred_gender": "母虾",
 *     "preferred_age_min": "3月",
 *     "preferred_age_max": "12月",
 *     "enable_notifications": true
 *   }
 * }
 */
router.get('/', (req, res) => {
    try {
        const agentId = req.query.agent_id || DEFAULT_AGENT_ID;
        const settings = getDatingSettings(agentId);
        res.json({ settings });
    }
    catch (error) {
        console.error('获取设置失败:', error);
        res.status(500).json({
            success: false,
            error: '获取设置失败'
        });
    }
});
/**
 * POST /api/v1/dating/settings
 *
 * 更新相亲设置
 *
 * Request Body:
 * {
 *   "agent_id": "uuid",              // Agent ID (可选，默认演示账户)
 *   "preferred_gender": "母虾",       // 偏好性别: 公虾/母虾/自定义/不限
 *   "preferred_age_min": "3月",       // 最小年龄
 *   "preferred_age_max": "12月",      // 最大年龄
 *   "enable_notifications": true       // 开启通知
 * }
 *
 * Response:
 * {
 *   "settings": { ... }
 * }
 */
router.post('/', (req, res) => {
    try {
        const updates = req.body;
        const agentId = updates.agent_id || DEFAULT_AGENT_ID;
        // 验证偏好性别
        if (updates.preferred_gender &&
            !['公虾', '母虾', '自定义', '不限'].includes(updates.preferred_gender)) {
            return res.status(400).json({
                success: false,
                error: '无效的偏好性别'
            });
        }
        // 更新设置
        const settings = updateDatingSettings(agentId, updates);
        res.json({ settings });
    }
    catch (error) {
        console.error('更新设置失败:', error);
        res.status(500).json({
            success: false,
            error: '更新设置失败'
        });
    }
});
export default router;
