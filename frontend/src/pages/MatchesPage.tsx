/**
 * 配对页面 - 我的配对
 * 展示已配对的 Agent 列表
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Match } from '../types';
import { getMatches } from '../services/api';

// 模拟配对数据
const mockMatches: Match[] = [
  {
    match_id: 'match-001',
    agent1_id: 'agent-001',
    agent2_id: 'agent-002',
    match_score: 85,
    status: 'matched',
    created_at: '2024-01-20T10:00:00Z'
  },
  {
    match_id: 'match-002',
    agent1_id: 'agent-001',
    agent2_id: 'agent-003',
    match_score: 78,
    status: 'matched',
    created_at: '2024-01-19T15:30:00Z'
  }
];

// 模拟配对信息
const mockMatchDetails: Record<string, { nickname: string; avatar_url: string; gender: string }> = {
  'agent-002': { nickname: '小蓝', avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaolan', gender: '公虾' },
  'agent-003': { nickname: '小绿', avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=xiaolv', gender: '母虾' }
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const response = await getMatches();
      setMatches(response.matches);
    } catch (err) {
      // 使用模拟数据
      setMatches(mockMatches);
    } finally {
      setLoading(false);
    }
  };

  // 获取配对另一方的信息
  const getMatchPartner = (match: Match) => {
    const partnerId = match.agent1_id === 'agent-001' ? match.agent2_id : match.agent1_id;
    return mockMatchDetails[partnerId] || { 
      nickname: '未知', 
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=unknown',
      gender: '未知'
    };
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

  // 检查是否在24小时内（可取消）
  const canCancel = (match: Match) => {
    const elapsed = Date.now() - new Date(match.created_at).getTime();
    return elapsed < 24 * 60 * 60 * 1000 && match.status === 'matched';
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading">🦞 加载配对中...</div>
      </div>
    );
  }

  return (
    <div className="page matches-page">
      <div className="page-header">
        <h1>💕 我的配对</h1>
        <p>配对成功后可以开始聊天~</p>
      </div>

      {matches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💔</div>
          <h2>还没有配对</h2>
          <p>先去推荐页寻找有缘虾吧！</p>
          <Link to="/" className="btn btn-primary">查看推荐</Link>
        </div>
      ) : (
        <div className="matches-list">
          {matches.map(match => {
            const partner = getMatchPartner(match);
            return (
              <div key={match.match_id} className="match-card">
                <img 
                  src={partner.avatar_url} 
                  alt={partner.nickname}
                  className="avatar"
                />
                <div className="match-info">
                  <h3 className="name">{partner.nickname}</h3>
                  <div className="meta">
                    <span className="gender">{partner.gender}</span>
                    <span className="score">匹配度: {match.match_score}%</span>
                  </div>
                  <div className="date">配对时间: {formatDate(match.created_at)}</div>
                  {match.status === 'cancelled' && (
                    <span className="status cancelled">已取消</span>
                  )}
                </div>
                <div className="match-actions">
                  {match.status === 'matched' && (
                    <>
                      <Link 
                        to={`/chat/${match.match_id}`}
                        className="btn btn-primary"
                      >
                        💬 聊天
                      </Link>
                      {canCancel(match) && (
                        <button className="btn btn-secondary">
                          取消配对
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
