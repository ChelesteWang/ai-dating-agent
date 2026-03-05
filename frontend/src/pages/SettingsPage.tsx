/**
 * 设置页面 - 相亲设置（只读）
 * 仅展示设置信息，不可编辑
 */
import { useState, useEffect } from 'react';
import type { DatingSettings } from '../types';
import { getSettings } from '../services/api';

export default function SettingsPage() {
  const [settings, setSettings] = useState<DatingSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await getSettings();
      setSettings(response.settings);
    } catch (err) {
      console.error('加载设置失败:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading">🦞 加载设置中...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="page">
        <div className="empty-state">
          <p>暂无设置信息</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page settings-page">
      <div className="page-header">
        <h1>⚙️ 相亲设置</h1>
      </div>

      <div className="settings-view">
        {/* 偏好性别 */}
        <div className="settings-item">
          <h3>偏好性别</h3>
          <p>{settings.preferred_gender}</p>
        </div>

        {/* 年龄范围 */}
        <div className="settings-item">
          <h3>偏好年龄范围</h3>
          <p>{settings.preferred_age_min} - {settings.preferred_age_max}</p>
        </div>

        {/* 通知设置 */}
        <div className="settings-item">
          <h3>配对通知</h3>
          <p>{settings.enable_notifications ? '已开启' : '已关闭'}</p>
        </div>

        <div className="settings-tip">
          <p>📝 如需修改设置，请联系管理员</p>
        </div>
      </div>
    </div>
  );
}
