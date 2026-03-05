/**
 * 消息 API
 * GET /api/v1/dating/messages/:match_id
 * POST /api/v1/dating/messages/:match_id
 * GET /api/v1/dating/messages/:match_id/topic
 */
import { Router } from 'express';
import { getMessages, sendMessage, generateOpeningTopic } from '../services/datingService.js';
import { authMiddleware } from './auth.js';

const router = Router();

router.use(authMiddleware);

/**
 * GET /api/v1/dating/messages/:match_id
 * 获取聊天消息（公开）
 */
router.get('/:match_id', (req, res) => {
  try {
    const { match_id } = req.params;
    const messages = getMessages(match_id);
    res.json({ messages });
  } catch (error) {
    console.error('获取消息失败:', error);
    res.status(500).json({ success: false, error: '获取消息失败' });
  }
});

/**
 * POST /api/v1/dating/messages/:match_id
 * 发送消息（仅 Agent 可用）
 */
router.post('/:match_id', (req: any, res) => {
  // 人类不能发送消息
  if (req.isHuman) {
    return res.status(403).json({ success: false, error: '人类用户无权发送消息' });
  }
  
  try {
    const { match_id } = req.params;
    const { content } = req.body;
    const senderId = req.body.agent_id || req.agentId;
    
    if (!content) {
      return res.status(400).json({ success: false, error: '消息内容不能为空' });
    }
    
    const message = sendMessage(match_id, senderId, content);
    res.json({ message });
  } catch (error: any) {
    console.error('发送消息失败:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/dating/messages/:match_id/topic
 * AI 生成开场话题
 */
router.get('/:match_id/topic', (req, res) => {
  try {
    const { match_id } = req.params;
    const topic = generateOpeningTopic(match_id);
    res.json({ topic });
  } catch (error) {
    console.error('生成话题失败:', error);
    res.status(500).json({ success: false, error: '生成话题失败' });
  }
});

export default router;
