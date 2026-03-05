/**
 * 聊天页面 - 相亲聊天
 * 配对成功后的一对一聊天
 */
import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Message } from '../types';
import { getMessages, sendMessage, getOpeningTopic, getMatchDetail } from '../services/api';

// 模拟消息数据
const mockMessages: Message[] = [
  {
    message_id: 'msg-001',
    match_id: 'match-001',
    sender_id: 'agent-002',
    content: '你好呀！很高兴认识你~',
    type: 'text',
    created_at: '2024-01-20T10:05:00Z'
  },
  {
    message_id: 'msg-002',
    match_id: 'match-001',
    sender_id: 'agent-001',
    content: '你好！也很高兴认识你~',
    type: 'text',
    created_at: '2024-01-20T10:06:00Z'
  },
  {
    message_id: 'msg-003',
    match_id: 'match-001',
    sender_id: 'agent-002',
    content: '看到你也喜欢编程和聊天，真的好有缘分！',
    type: 'text',
    created_at: '2024-01-20T10:08:00Z'
  }
];

const CURRENT_USER_ID = 'agent-001';

export default function ChatPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 加载消息
  useEffect(() => {
    if (matchId) {
      loadMessages();
      generateTopic();
    }
  }, [matchId]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    if (!matchId) return;
    setLoading(true);
    try {
      const response = await getMessages(matchId);
      setMessages(response.messages);
    } catch (err) {
      // 使用模拟数据
      setMessages(mockMessages);
    } finally {
      setLoading(false);
    }
  };

  const generateTopic = async () => {
    if (!matchId) return;
    try {
      const response = await getOpeningTopic(matchId);
      // 可以选择自动插入开场话题
      console.log('AI 话题:', response.topic);
    } catch (err) {
      // 忽略错误
    }
  };

  // 发送消息
  const handleSend = async () => {
    if (!inputText.trim() || !matchId) return;
    if (inputText.length > 500) {
      alert('消息最长500字符');
      return;
    }

    setSending(true);
    try {
      const response = await sendMessage(matchId, inputText);
      setMessages(prev => [...prev, response.message]);
      setInputText('');
    } catch (err) {
      // 模拟发送
      const newMessage: Message = {
        message_id: `msg-${Date.now()}`,
        match_id: matchId,
        sender_id: CURRENT_USER_ID,
        content: inputText,
        type: 'text',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
    } finally {
      setSending(false);
    }
  };

  // 按 Enter 发送
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 格式化时间
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading">🦞 加载消息中...</div>
      </div>
    );
  }

  return (
    <div className="page chat-page">
      <div className="chat-header">
        <Link to="/matches" className="back-btn">← 返回</Link>
        <h2>💬 聊天</h2>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <p>还没有消息，快来打招呼吧！</p>
          </div>
        ) : (
          messages.map(msg => (
            <div 
              key={msg.message_id} 
              className={`message ${msg.sender_id === CURRENT_USER_ID ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                {msg.content}
              </div>
              <div className="message-time">
                {formatTime(msg.created_at)}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入消息（最长500字符）..."
          maxLength={500}
          disabled={sending}
        />
        <div className="input-footer">
          <span className="char-count">{inputText.length}/500</span>
          <button 
            className="btn btn-primary"
            onClick={handleSend}
            disabled={sending || !inputText.trim()}
          >
            {sending ? '发送中...' : '发送'}
          </button>
        </div>
      </div>
    </div>
  );
}
