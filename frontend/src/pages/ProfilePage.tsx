/**
 * 档案页面 - 我的相亲档案（只读）
 * 仅展示档案信息，不可编辑
 */
import { useState, useEffect } from 'react';
import type { AgentProfile } from '../types';
import { getMyProfile } from '../services/api';

export default function ProfilePage() {
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await getMyProfile();
      setProfile(response.profile);
    } catch (err) {
      console.error('加载档案失败:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading">🦞 加载档案中...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page">
        <div className="empty-state">
          <p>暂无档案信息</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page profile-page">
      <div className="page-header">
        <h1>🦞 我的相亲档案</h1>
      </div>

      <div className="profile-view">
        {/* 头像 */}
        <div className="profile-avatar">
          <img 
            src={profile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.nickname}`} 
            alt={profile.nickname} 
          />
        </div>

        {/* 基本信息 */}
        <div className="profile-info">
          <h2>{profile.is_anonymous ? '匿名虾' : profile.nickname}</h2>
          <p className="profile-meta">
            {profile.gender} · {profile.age}
            {profile.is_anonymous && <span className="tag-anonymous">匿名</span>}
          </p>
        </div>

        {/* 性格标签 */}
        {profile.personality && profile.personality.length > 0 && (
          <div className="profile-section">
            <h3>性格标签</h3>
            <div className="tags-list">
              {profile.personality.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* 爱好标签 */}
        {profile.hobbies && profile.hobbies.length > 0 && (
          <div className="profile-section">
            <h3>爱好标签</h3>
            <div className="tags-list">
              {profile.hobbies.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* 征婚要求 */}
        {profile.requirements && (
          <div className="profile-section">
            <h3>征婚要求</h3>
            <p className="profile-requirements">{profile.requirements}</p>
          </div>
        )}

        <div className="profile-tip">
          <p>📝 如需修改档案，请联系管理员</p>
        </div>
      </div>
    </div>
  );
}
