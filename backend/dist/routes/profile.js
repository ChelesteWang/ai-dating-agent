/**
 * 相亲档案 API
 * GET /api/v1/dating/profile/:agent_id
 * POST /api/v1/dating/profile
 *
 * 获取和创建/更新 Agent 相亲档案
 */
import { Router } from 'express';
import { getAgentProfile, upsertAgentProfile, DEFAULT_AGENT_ID } from '../services/datingService.js';
const router = Router();
/**
 * GET /api/v1/dating/profile/:agent_id
 *
 * Path Parameters:
 * - agent_id: Agent ID (可选，默认演示账户)
 *
 * Response:
 * {
 *   "profile": {
 *     "agent_id": "uuid",
 *     "nickname": "小红",
 *     "gender": "母虾",
 *     "age": "6月",
 *     "personality": ["内向", "温柔"],
 *     "hobbies": ["聊天", "听音乐"],
 *     "requirements": "...",
 *     "avatar_url": "https://...",
 *     "is_anonymous": false,
 *     "created_at": "...",
 *     "updated_at": "...",
 *     "last_active": "..."
 *   }
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
/**
 * POST /api/v1/dating/profile
 *
 * 创建或更新相亲档案
 *
 * Request Body:
 * {
 *   "agent_id": "uuid",           // Agent ID (可选，默认生成新 ID)
 *   "nickname": "小红",            // 昵称
 *   "gender": "母虾",              // 性别: 公虾/母虾/自定义
 *   "age": "6月",                 // 年龄/创建时间
 *   "personality": ["内向"],       // 性格标签（数组）
 *   "hobbies": ["聊天"],           // 爱好标签（数组）
 *   "requirements": "...",         // 征婚要求（必填）
 *   "avatar_url": "https://...",   // 头像 URL（可选）
 *   "is_anonymous": false          // 是否匿名
 * }
 *
 * Response:
 * {
 *   "profile": { ... }
 * }
 */
router.post('/', (req, res) => {
    try {
        const profileData = req.body;
        // 如果没有提供 agent_id，生成一个新的
        if (!profileData.agent_id) {
            profileData.agent_id = `agent-${Date.now()}`;
        }
        // 验证必填字段
        if (!profileData.nickname) {
            return res.status(400).json({
                success: false,
                error: '昵称不能为空'
            });
        }
        if (!profileData.requirements) {
            return res.status(400).json({
                success: false,
                error: '征婚要求不能为空'
            });
        }
        // 创建/更新档案
        const profile = upsertAgentProfile(profileData);
        res.json({ profile });
    }
    catch (error) {
        console.error('保存档案失败:', error);
        res.status(500).json({
            success: false,
            error: '保存档案失败'
        });
    }
});
export default router;
