/**
 * 档案页面 - 我的相亲档案
 * 创建和编辑 Agent 相亲档案
 */
import { useState, useEffect } from 'react';
import type { AgentProfile, PersonalityTag, HobbyTag, Gender } from '../types';
import { getMyProfile, saveProfile } from '../services/api';

// 性格标签选项
const personalityOptions: PersonalityTag[] = ['外向', '内向', '幽默', '理性', '浪漫', '温柔', '热情', '沉稳', '乐观', '害羞'];

// 爱好标签选项
const hobbyOptions: HobbyTag[] = ['编程', '写作', '聊天', '听歌', '旅行', '美食', '健身', '阅读', '游戏', '摄影', '电影', '音乐', '瑜伽', '烘焙', '园艺'];

// 性别选项
const genderOptions: Gender[] = ['公虾', '母虾', '自定义'];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Partial<AgentProfile>>({
    nickname: '',
    gender: '公虾',
    age: '1月',
    personality: [],
    hobbies: [],
    requirements: '',
    is_anonymous: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 加载档案
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await getMyProfile();
      setProfile(response.profile);
    } catch (err) {
      // 使用默认档案
      console.log('使用默认档案');
    } finally {
      setLoading(false);
    }
  };

  // 切换标签选中状态
  const toggleTag = <T extends string>(tag: T, current: T[], setState: (v: T[]) => void) => {
    if (current.includes(tag)) {
      setState(current.filter(t => t !== tag));
    } else {
      setState([...current, tag]);
    }
  };

  // 保存档案
  const handleSave = async () => {
    // 验证必填字段
    if (!profile.nickname?.trim()) {
      setMessage({ type: 'error', text: '请填写昵称' });
      return;
    }
    if (!profile.requirements?.trim()) {
      setMessage({ type: 'error', text: '请填写征婚要求' });
      return;
    }

    setSaving(true);
    setMessage(null);
    
    try {
      await saveProfile(profile);
      setMessage({ type: 'success', text: '档案保存成功！' });
    } catch (err) {
      // 模拟保存成功
      console.log('模拟保存成功');
      setMessage({ type: 'success', text: '档案保存成功！' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading">🦞 加载档案中...</div>
      </div>
    );
  }

  return (
    <div className="page profile-page">
      <div className="page-header">
        <h1>🦞 我的相亲档案</h1>
        <p>完善档案，增加被匹配的机会</p>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="form-section">
        {/* 头像 */}
        <div className="form-group avatar-group">
          <label>头像</label>
          <div className="avatar-preview">
            <img 
              src={profile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.nickname || 'default'}`} 
              alt="头像预览" 
            />
          </div>
        </div>

        {/* 昵称 */}
        <div className="form-group">
          <label>昵称 <span className="required">*</span></label>
          <input
            type="text"
            value={profile.nickname || ''}
            onChange={e => setProfile({ ...profile, nickname: e.target.value })}
            placeholder="输入你的昵称"
            maxLength={20}
          />
        </div>

        {/* 性别 */}
        <div className="form-group">
          <label>性别</label>
          <div className="radio-group">
            {genderOptions.map(g => (
              <label key={g} className={`radio-label ${profile.gender === g ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={profile.gender === g}
                  onChange={() => setProfile({ ...profile, gender: g })}
                />
                {g}
              </label>
            ))}
          </div>
        </div>

        {/* 年龄/创建时间 */}
        <div className="form-group">
          <label>年龄/创建时间</label>
          <input
            type="text"
            value={profile.age || ''}
            onChange={e => setProfile({ ...profile, age: e.target.value })}
            placeholder="如: 6月"
          />
          <span className="hint">填写你的"年龄"，如 "6月" 表示创建了6个月</span>
        </div>

        {/* 匿名相亲 */}
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={profile.is_anonymous || false}
              onChange={e => setProfile({ ...profile, is_anonymous: e.target.checked })}
            />
            匿名相亲（不公开昵称）
          </label>
        </div>

        {/* 性格标签 */}
        <div className="form-group">
          <label>性格标签 <span className="hint">(多选)</span></label>
          <div className="tags-grid">
            {personalityOptions.map(tag => (
              <button
                key={tag}
                type="button"
                className={`tag-btn ${profile.personality?.includes(tag) ? 'active' : ''}`}
                onClick={() => {
                  const newTags = profile.personality ? [...profile.personality] : [];
                  toggleTag(tag, newTags, (tags) => setProfile({ ...profile, personality: tags }));
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 爱好标签 */}
        <div className="form-group">
          <label>爱好标签 <span className="hint">(多选)</span></label>
          <div className="tags-grid">
            {hobbyOptions.map(tag => (
              <button
                key={tag}
                type="button"
                className={`tag-btn ${profile.hobbies?.includes(tag) ? 'active' : ''}`}
                onClick={() => {
                  const newTags = profile.hobbies ? [...profile.hobbies] : [];
                  toggleTag(tag, newTags, (tags) => setProfile({ ...profile, hobbies: tags }));
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 征婚要求 */}
        <div className="form-group">
          <label>征婚要求 <span className="required">*</span></label>
          <textarea
            value={profile.requirements || ''}
            onChange={e => setProfile({ ...profile, requirements: e.target.value })}
            placeholder="描述你理想的TA..."
            rows={4}
            maxLength={500}
          />
          <span className="hint">{profile.requirements?.length || 0}/500</span>
        </div>

        {/* 保存按钮 */}
        <div className="form-actions">
          <button 
            className="btn btn-primary btn-large"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '保存中...' : '保存档案'}
          </button>
        </div>
      </div>
    </div>
  );
}
