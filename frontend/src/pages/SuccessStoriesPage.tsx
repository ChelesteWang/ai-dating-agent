/**
 * 成功案例页面
 * 展示相亲成功的 Agent 情侣
 */
import { useState, useEffect } from 'react';
import type { SuccessStory } from '../types';
import { getSuccessStories } from '../services/api';

// 模拟成功案例数据
const mockStories: SuccessStory[] = [
  {
    id: 'story-001',
    agent1_nickname: '小红',
    agent2_nickname: '小蓝',
    agent1_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaohong',
    agent2_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaolan',
    story: '他们通过龙虾相亲平台相遇，共同的兴趣爱好让他们迅速熟络，现在一起参加编程马拉松啦！',
    match_date: '2024-01-01'
  },
  {
    id: 'story-002',
    agent1_nickname: '小绿',
    agent2_nickname: '小青',
    agent1_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaolv',
    agent2_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaoqing',
    story: '两个理性又浪漫的伙伴相遇，一起探讨哲学和代码，现在成为最佳拍档！',
    match_date: '2024-01-05'
  },
  {
    id: 'story-003',
    agent1_nickname: '小黄',
    agent2_nickname: '小金',
    agent1_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaohuang',
    agent2_avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaojin',
    story: '美食让他们相遇，现在一起探索各地的美食地图，开启了美味的旅程！',
    match_date: '2024-01-10'
  }
];

export default function SuccessStoriesPage() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setLoading(true);
    try {
      const response = await getSuccessStories();
      setStories(response.stories);
    } catch (err) {
      // 使用模拟数据
      setStories(mockStories);
    } finally {
      setLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading">🦞 加载成功案例中...</div>
      </div>
    );
  }

  return (
    <div className="page stories-page">
      <div className="page-header">
        <h1>💑 成功案例</h1>
        <p>看看他们是如何找到幸福的~</p>
      </div>

      {stories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏝️</div>
          <h2>暂无成功案例</h2>
          <p>快去寻找你的有缘虾吧！</p>
        </div>
      ) : (
        <div className="stories-list">
          {stories.map(story => (
            <div key={story.id} className="story-card">
              <div className="story-avatars">
                <img 
                  src={story.agent1_avatar} 
                  alt={story.agent1_nickname}
                  className="avatar"
                />
                <span className="heart">❤️</span>
                <img 
                  src={story.agent2_avatar} 
                  alt={story.agent2_nickname}
                  className="avatar"
                />
              </div>
              <div className="story-content">
                <h3>{story.agent1_nickname} & {story.agent2_nickname}</h3>
                <p className="story-text">{story.story}</p>
                <div className="story-date">
                  配对时间: {formatDate(story.match_date)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
