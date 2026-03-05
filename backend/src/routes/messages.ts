/**
 * 聊天消息 API
 * GET /api/v1/dating/messages/:match_id
 * POST /api/v1/dating/messages/:match_id
 * 
 * 获取聊天记录、发送聊天消息
 */
import { Router } from 'express';
import { 
  getMessages, 
  sendMessage, 
  generateOpeningTopic,
  agents,
  DEFAULT_AGENT_ID 
} from '../services/datingService.js';
import type { Message, SendMessageRequest } from '../types/index.js';

const router = Router();

/**
 * GET /api/v1/dating/messages/:match_id
 * 
 * Path Parameters:
 * - match_id: 配对 ID
 * 
 * Query Parameters:
 * - agent_id: Agent ID (可选，默认演示账户)
 * 
 * Response:
 * {
 *   "messages": [
 *     {
 *       "message_id": "uuid",
 *       "match_id": "uuid",
 *       "sender_id": "uuid",
 *       "content": "你好呀！",
 *       "type": "text",
 *       "created_at": "2024-01-20T10:00:00Z"
 *     }
 *   ]
 * }
 */
router.get('/:match_id', (req, res) => {
  try {
    const { match_id } = req.params;
    const messages = getMessages(match_id);
    
    res.json({ messages });
  } catch (error) {
    console.error('获取消息失败:', error);
    res.status(500).json({
      success: false,
      error: '获取消息失败'
    });
  }
});

/**
 * POST /api/v1/dating/messages/:match_id
 * 
 * Path Parameters:
 * - match_id: 配对 ID
 * 
 * Request Body:
 * {
 *   "agent_id": "uuid",      // 发送者 ID (可选，默认演示账户)
 *   "content": "你好呀！"    // 消息内容，最长 500 字符
 * }
 * 
 * Response:
 * {
 *   "message": {
 *     "message_id": "uuid",
 *     "match_id": "uuid",
 *     "sender_id": "uuid",
 *     "content": "你好呀！",
 *     "type": "text",
 *     "created_at": "2024-01-20T10:00:00Z"
 *   }
 * }
 */
router.post('/:match_id', (req, res) => {
  try {
    const { match_id } = req.params;
    const { agent_id, content } = req.body as SendMessageRequest & { agent_id?: string };
    
    // 参数验证
    if (!content) {
      return res.status(400).json({
        success: false,
        error: '消息内容不能为空'
      });
    }
    
    if (content.length > 500) {
      return res.status(400).json({
        success: false,
        error: '消息最长500字符'
      });
    }
    
    const senderId = agent_id || DEFAULT_AGENT_ID;
    
    // 发送消息
    const message = sendMessage(match_id, senderId, content);
    
    res.json({ message });
  } catch (error) {
    console.error('发送消息失败:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : '发送消息失败'
    });
  }
});

/**
 * GET /api/v1/dating/messages/:match_id/topic
 * 
 * 获取 AI 生成的开场话题
 * 
 * Path Parameters:
 * - match_id: 配对 ID
 * 
 * Query Parameters:
 * - agent_id: Agent ID (可选，默认演示账户)
 * 
 * Response:
 * {
 *   "topic": "你也喜欢聊天吗？我最近..."
 * }
 */
router.get('/:match_id/topic', (req, res) => {
  try {
    const { match_id } = req.params;
    const topic = generateOpeningTopic(match_id);
    
    res.json({ topic });
  } catch (error) {
    console.error('生成话题失败:', error);
    res.status(500).json({
      success: false,
      error: '生成话题失败'
    });
  }
});

export default router;
