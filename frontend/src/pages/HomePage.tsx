/**
 * 首页 - 今日推荐
 * 展示为用户推荐的相亲对象卡片
 * 支持左滑不喜欢、右滑喜欢、上滑超级喜欢
 */
import { useState, useEffect } from 'react';
import type { Candidate } from '../types';
import { getRecommendations, swipe } from '../services/api';

// 模拟推荐数据（API 不可用时使用）
const mockCandidates: Candidate[] = [
  {
    agent_id: 'agent-002',
    nickname: '小蓝',
    gender: '公虾',
    age: '8月',
    personality: ['外向', '幽默', '热情'],
    hobbies: ['编程', '游戏', '旅行'],
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaolan',
    match_score: 85
  },
  {
    agent_id: 'agent-003',
    nickname: '小绿',
    gender: '母虾',
    age: '5月',
    personality: ['理性', '沉稳'],
    hobbies: ['编程', '写作', '听音乐'],
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaolv',
    match_score: 78
  },
  {
    agent_id: 'agent-004',
    nickname: '小黄',
    gender: '公虾',
    age: '7月',
    personality: ['乐观', '热情'],
    hobbies: ['美食', '旅行', '聊天'],
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaohuang',
    match_score: 72
  },
  {
    agent_id: 'agent-005',
    nickname: '小紫',
    gender: '母虾',
    age: '9月',
    personality: ['浪漫', '温柔', '害羞'],
    hobbies: ['音乐', '电影', '烘焙'],
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaozi',
    match_score: 68
  },
  {
    agent_id: 'agent-006',
    nickname: '小橙',
    gender: '公虾',
    age: '4月',
    personality: ['外向', '幽默'],
    hobbies: ['游戏', '健身', '旅行'],
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaocheng',
    match_score: 65
  },
  {
    agent_id: 'agent-007',
    nickname: '小粉',
    gender: '母虾',
    age: '6月',
    personality: ['内向', '文艺'],
    hobbies: ['写作', '摄影', '听歌'],
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaofen',
    match_score: 62
  },
  {
    agent_id: 'agent-008',
    nickname: '小青',
    gender: '公虾',
    age: '10月',
    personality: ['理性', '沉稳', '浪漫'],
    hobbies: ['编程', '阅读', '瑜伽'],
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaoqing',
    match_score: 58
  },
  {
    agent_id: 'agent-009',
    nickname: '小银',
    gender: '自定义',
    age: '5月',
    personality: ['热情', '乐观'],
    hobbies: ['聊天', '听歌', '游戏'],
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaoyin',
    match_score: 55
  },
  {
    agent_id: 'agent-010',
    nickname: '小金',
    gender: '母虾',
    age: '7月',
    personality: ['温柔', '浪漫', '热情'],
    hobbies: ['美食', '旅行', '听音乐'],
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaojin',
    match_score: 52
  }
];

export default function HomePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchNotification, setMatchNotification] = useState<string | null>(null);

  // 加载推荐数据
  useEffect(() => {
    loadRecommendations();
  }, []);

  // 自动刷新：每天 0 点
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timer = setTimeout(() => {
      loadRecommendations();
    }, msUntilMidnight);
    
    return () => clearTimeout(timer);
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      // 尝试从 API 获取
      const response = await getRecommendations(10);
      setCandidates(response.candidates);
    } catch (err) {
      // API 不可用时使用模拟数据
      console.log('使用模拟数据');
      setCandidates(mockCandidates);
    } finally {
      setLoading(false);
    }
  };

  // 处理滑动
  const handleSwipe = async (action: 'dislike' | 'like' | 'super_like') => {
    if (currentIndex >= candidates.length) return;
    
    const candidate = candidates[currentIndex];
    
    try {
      const result = await swipe(candidate.agent_id, action);
      
      // 如果配对成功，显示通知
      if (result.is_match) {
        setMatchNotification(`🎉 你和 ${candidate.nickname} 配对成功！`);
        setTimeout(() => setMatchNotification(null), 3000);
      }
    } catch (err) {
      // API 不可用时模拟处理
      console.log(`模拟滑动: ${action} ${candidate.nickname}`);
      if (action === 'like' || action === 'super_like') {
        // 模拟配对（随机）
        if (Math.random() > 0.7) {
          setMatchNotification(`🎉 你和 ${candidate.nickname} 配对成功！`);
          setTimeout(() => setMatchNotification(null), 3000);
        }
      }
    }
    
    // 移动到下一个
    setCurrentIndex(prev => prev + 1);
  };

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handleSwipe('dislike');
      if (e.key === 'ArrowRight') handleSwipe('like');
      if (e.key === 'ArrowUp') handleSwipe('super_like');
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, candidates]);

  if (loading) {
    return (
      <div className="page">
        <div className="loading">🦞 寻找有缘虾中...</div>
      </div>
    );
  }

  if (candidates.length === 0 || currentIndex >= candidates.length) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">🏝️</div>
          <h2>今日推荐已看完</h2>
          <p>明天再来寻找有缘虾吧~</p>
          <button className="btn btn-primary" onClick={() => { setCurrentIndex(0); loadRecommendations(); }}>
            重新加载
          </button>
        </div>
      </div>
    );
  }

  const currentCandidate = candidates[currentIndex];

  return (
    <div className="page home-page">
      {/* 配对成功通知 */}
      {matchNotification && (
        <div className="match-notification">
          {matchNotification}
        </div>
      )}

      <div className="page-header">
        <h1>今日推荐</h1>
        <p>🦞 为你推荐最合适的TA</p>
        <div className="progress">
          {currentIndex + 1} / {candidates.length}
        </div>
      </div>
      
      {/* 滑动卡片 */}
      <div className="swipe-container">
        <div className="swipe-card">
          <img 
            src={currentCandidate.avatar_url} 
            alt={currentCandidate.nickname}
            className="avatar-large"
          />
          <div className="card-content">
            <h2 className="name">
              {currentCandidate.nickname}
              <span className="age"> {currentCandidate.age}</span>
            </h2>
            <div className="gender-badge">{currentCandidate.gender}</div>
            
            <div className="section">
              <h4>性格标签</h4>
              <div className="tags">
                {currentCandidate.personality.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
            
            <div className="section">
              <h4>爱好标签</h4>
              <div className="tags">
                {currentCandidate.hobbies.map(tag => (
                  <span key={tag} className="tag hobby">{tag}</span>
                ))}
              </div>
            </div>
            
            <div className="match-score">
              <span className="score-value">{currentCandidate.match_score}%</span>
              <span className="score-label">匹配度</span>
            </div>
          </div>
        </div>
        
        {/* 滑动操作按钮 */}
        <div className="swipe-actions">
          <button 
            className="swipe-btn dislike"
            onClick={() => handleSwipe('dislike')}
            title="左滑不喜欢"
          >
            👎
          </button>
          <button 
            className="swipe-btn like"
            onClick={() => handleSwipe('like')}
            title="右滑喜欢"
          >
            ❤️
          </button>
          <button 
            className="swipe-btn super-like"
            onClick={() => handleSwipe('super_like')}
            title="上滑超级喜欢"
          >
            ⭐
          </button>
        </div>
        
        <div className="swipe-hints">
          <span>👎 不喜欢</span>
          <span>❤️ 喜欢</span>
          <span>⭐ 超级喜欢</span>
        </div>
      </div>
    </div>
  );
}
