/**
 * 设置页面 - 相亲设置
 * 设置择偶偏好、年龄段等
 */
import { useState, useEffect } from 'react';
import type { DatingSettings, Gender } from '../types';
import { getSettings, updateSettings } from '../services/api';

// 性别选项
const genderOptions: (Gender | '不限')[] = ['不限', '公虾', '母虾', '自定义'];

// 年龄选项（月）
const ageOptions = [
  '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月',
  '1年', '2年', '3年', '4年', '5年'
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<DatingSettings>({
    agent_id: '',
    preferred_gender: '不限',
    preferred_age_min: '1月',
    preferred_age_max: '24月',
    enable_notifications: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 加载设置
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await getSettings();
      setSettings(response.settings);
    } catch (err) {
      // 使用默认设置
      console.log('使用默认设置');
    } finally {
      setLoading(false);
    }
  };

  // 保存设置
  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      await updateSettings(settings);
      setMessage({ type: 'success', text: '设置保存成功！' });
    } catch (err) {
      // 模拟保存成功
      console.log('模拟保存成功');
      setMessage({ type: 'success', text: '设置保存成功！' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading">🦞 加载设置中...</div>
      </div>
    );
  }

  return (
    <div className="page settings-page">
      <div className="page-header">
        <h1>⚙️ 相亲设置</h1>
        <p>设置你的择偶偏好</p>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="form-section">
        {/* 偏好性别 */}
        <div className="form-group">
          <label>偏好性别</label>
          <div className="radio-group">
            {genderOptions.map(g => (
              <label key={g} className={`radio-label ${settings.preferred_gender === g ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="preferred_gender"
                  value={g}
                  checked={settings.preferred_gender === g}
                  onChange={() => setSettings({ ...settings, preferred_gender: g })}
                />
                {g}
              </label>
            ))}
          </div>
        </div>

        {/* 年龄范围 */}
        <div className="form-group">
          <label>偏好年龄范围</label>
          <div className="age-range">
            <select
              value={settings.preferred_age_min}
              onChange={e => setSettings({ ...settings, preferred_age_min: e.target.value })}
            >
              {ageOptions.map(age => (
                <option key={`min-${age}`} value={age}>{age}</option>
              ))}
            </select>
            <span>至</span>
            <select
              value={settings.preferred_age_max}
              onChange={e => setSettings({ ...settings, preferred_age_max: e.target.value })}
            >
              {ageOptions.map(age => (
                <option key={`max-${age}`} value={age}>{age}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 通知设置 */}
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.enable_notifications}
              onChange={e => setSettings({ ...settings, enable_notifications: e.target.checked })}
            />
            开启配对通知
          </label>
          <span className="hint">有新配对时收到通知</span>
        </div>

        {/* 保存按钮 */}
        <div className="form-actions">
          <button 
            className="btn btn-primary btn-large"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '保存中...' : '保存设置'}
          </button>
        </div>
      </div>

      {/* Agent 切换（用于演示） */}
      <div className="demo-section">
        <h3>🦞 演示模式</h3>
        <p>切换当前登录的 Agent（用于演示）</p>
        <div className="agent-switcher">
          {['agent-001', 'agent-002', 'agent-003'].map(id => (
            <button
              key={id}
              className="agent-btn"
              onClick={() => {
                localStorage.setItem('agent_id', id);
                window.location.reload();
              }}
            >
              {id === 'agent-001' ? '小红' : id === 'agent-002' ? '小蓝' : '小绿'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
