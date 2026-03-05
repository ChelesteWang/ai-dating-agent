/**
 * 管理后台页面
 * 人类辅助功能：配置、查看、举报管理
 */
import { useState } from 'react';
import type { Report, SystemConfig } from '../types';

// 模拟配置数据
const mockConfigs: SystemConfig[] = [
  { key: 'max_recommendations_per_day', value: '10', description: '每日最大推荐数' },
  { key: 'min_match_score', value: '60', description: '最小匹配分数阈值' },
  { key: 'agent_greeting_enabled', value: 'true', description: '是否启用 Agent 主动问候' },
  { key: 'followup_reminder_days', value: '3', description: '跟进提醒间隔（天）' },
  { key: 'success_story_approval', value: 'true', description: '成功案例需要审核' },
];

// 模拟举报数据
const mockReports: Report[] = [
  {
    id: 'r1',
    reporterId: 'user1',
    reportedUserId: 'user100',
    reason: '虚假信息',
    description: '对方提供的年龄和照片不符',
    status: 'pending',
    createdAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 'r2',
    reporterId: 'user2',
    reportedUserId: 'user200',
    reason: '骚扰行为',
    description: '频繁发送不当消息',
    status: 'reviewed',
    createdAt: '2024-01-19T15:30:00Z'
  },
  {
    id: 'r3',
    reporterId: 'user3',
    reportedUserId: 'user300',
    reason: '其他',
    description: '行为举止让人不适',
    status: 'resolved',
    createdAt: '2024-01-18T09:00:00Z'
  }
];

type AdminTab = 'config' | 'reports' | 'users';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('config');
  const [configs] = useState<SystemConfig[]>(mockConfigs);
  const [reports] = useState<Report[]>(mockReports);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      pending: { text: '待处理', className: 'pending' },
      reviewed: { text: '已审查', className: 'reviewed' },
      resolved: { text: '已解决', className: 'resolved' }
    };
    return statusMap[status] || statusMap.pending;
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>管理后台</h1>
        <p>人类辅助功能：配置、查看、举报管理</p>
      </div>
      
      <div className="admin-container">
        <div className="admin-sidebar">
          <h3>功能菜单</h3>
          <button 
            className={activeTab === 'config' ? 'active' : ''}
            onClick={() => setActiveTab('config')}
          >
            ⚙️ 系统配置
          </button>
          <button 
            className={activeTab === 'reports' ? 'active' : ''}
            onClick={() => setActiveTab('reports')}
          >
            🚨 举报管理
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            👥 用户查看
          </button>
        </div>
        
        <div className="admin-content">
          {activeTab === 'config' && (
            <div>
              <h2>系统配置</h2>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                配置 AI Agent 的行为参数
              </p>
              {configs.map(config => (
                <div key={config.key} className="config-item">
                  <div>
                    <label>{config.description}</label>
                    <p style={{ fontSize: '12px', color: '#999' }}>{config.key}</p>
                  </div>
                  <input 
                    type="text" 
                    defaultValue={config.value}
                    style={{ width: '100px' }}
                  />
                </div>
              ))}
              <button className="btn btn-primary" style={{ marginTop: '16px' }}>
                保存配置
              </button>
            </div>
          )}
          
          {activeTab === 'reports' && (
            <div>
              <h2>举报管理</h2>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                处理用户举报信息
              </p>
              {reports.map(report => {
                const statusInfo = getStatusBadge(report.status);
                return (
                  <div key={report.id} className="report-item">
                    <div className="report-info">
                      <h4>举报原因: {report.reason}</h4>
                      <p>被举报用户ID: {report.reportedUserId}</p>
                      <p>详细描述: {report.description}</p>
                      <p style={{ fontSize: '12px', color: '#999' }}>
                        举报时间: {new Date(report.createdAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className={`report-status ${statusInfo.className}`}>
                        {statusInfo.text}
                      </span>
                      {report.status === 'pending' && (
                        <>
                          <button className="btn btn-sm btn-success">处理</button>
                          <button className="btn btn-sm btn-secondary">忽略</button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {activeTab === 'users' && (
            <div>
              <h2>用户查看</h2>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                查看平台用户列表和状态
              </p>
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                <p>用户列表功能开发中...</p>
                <p style={{ fontSize: '14px' }}>可查看用户档案、配对记录等信息</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
