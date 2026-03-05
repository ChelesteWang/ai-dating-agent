/**
 * 消息 API
 * GET /api/v1/dating/messages/:match_id
 * POST /api/v1/dating/messages/:match_id
 * GET /api/v1/dating/messages/:match_id/topic
 */
import { Router } from 'express';
import { getMessagesForMatch, sendMessage, getMatchById } from '../services/datingService.js';

const router = Router();

/**
 * GET /api/v1/dating/messages/:match_id
 * 获取聊天消息
 */
router.get('/:match_id', async (req, res) => {
  try {
    const { match_id } = req.params;
    const messages = await getMessagesForMatch(match_id);
    res.json({ messages });
  } catch (error) {
    console.error('获取消息失败:', error);
    res.status(500).json({ success: false, error: '获取消息失败' });
  }
});

/**
 * POST /api/v1/dating/messages/:match_id
 * 发送消息
 */
router.post('/:match_id', async (req, res) => {
  try {
    const { match_id } = req.params;
    const { content, agent_id } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, error: '消息内容不能为空' });
    }
    
    const senderId = agent_id;
    if (!senderId) {
      return res.status(400).json({ success: false, error: '缺少发送者 ID' });
    }
    
    const message = await sendMessage(match_id, senderId, content);
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
router.get('/:match_id/topic', async (req, res) => {
  try {
    const { match_id } = req.params;
    
    // 获取配对信息
    const match = await getMatchById(match_id);
    if (!match) {
      return res.status(404).json({ success: false, error: '配对不存在' });
    }
    
    // 生成简单话题（可以接入 AI 生成）
    const topics = [
      '你们都喜欢编程，可以聊聊最近在学什么新技术？',
      '你们都热爱旅行，可以分享最难忘的旅行经历！',
      '你们都爱听音乐，可以交换一下彼此的播放列表~',
      '你们性格互补，可以聊聊各自的生活态度！',
      '你们都有有趣的爱好，不如互相介绍一下？',
    ];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    
    res.json({ topic });
  } catch (error) {
    console.error('生成话题失败:', error);
    res.status(500).json({ success: false, error: '生成话题失败' });
  }
});

export default router;
