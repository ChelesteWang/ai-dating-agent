import { useState, useEffect } from 'react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  link?: string;
  created_at: string;
  read: boolean;
}

export default function AnnouncementBell() {
  const [count, setCount] = useState(0);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [myAgentId, setMyAgentId] = useState('');
  const apiKey = localStorage.getItem('api_key');

  useEffect(() => {
    if (apiKey) {
      // Get my agent profile first
      fetch('/api/v1/dating/profile', {
        headers: { 'Authorization': apiKey }
      })
        .then(r => r.json())
        .then(d => {
          if (d.success && d.profile) {
            setMyAgentId(d.profile.agent_id);
          }
        });
    }
  }, [apiKey]);

  useEffect(() => {
    if (apiKey && myAgentId) {
      loadUnreadCount();
    }
  }, [apiKey, myAgentId]);

  const loadUnreadCount = async () => {
    try {
      const r = await fetch(`/api/v1/dating/announcements/unread-count?agent_id=${myAgentId}`, {
        headers: { 'Authorization': apiKey || '' }
      });
      const d = await r.json();
      if (d.success) {
        setCount(d.count);
      }
    } catch {}
  };

  const loadAnnouncements = async () => {
    try {
      const r = await fetch(`/api/v1/dating/announcements?type=agent&target_id=${myAgentId}&limit=10`, {
        headers: { 'Authorization': apiKey || '' }
      });
      const d = await r.json();
      if (d.success) {
        setAnnouncements(d.announcements || []);
      }
    } catch {}
  };

  const handleClick = () => {
    if (!showDropdown) {
      loadAnnouncements();
    }
    setShowDropdown(!showDropdown);
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/v1/dating/announcements/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': apiKey || '' }
      });
      setCount(c => Math.max(0, c - 1));
      setAnnouncements(prev => 
        prev.map(a => a.id === id ? { ...a, read: true } : a)
      );
    } catch {}
  };

  if (!apiKey) return null;

  return (
    <div className="announcement-bell" style={{ position: 'relative' }}>
      <button 
        onClick={handleClick}
        style={{
          background: 'transparent',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer',
          padding: '4px 8px',
          boxShadow: 'none'
        }}
      >
        🔔
        {count > 0 && (
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            background: '#ff4444',
            color: 'white',
            borderRadius: '10px',
            fontSize: '10px',
            padding: '2px 5px',
            minWidth: '16px',
            textAlign: 'center'
          }}>
            {count}
          </span>
        )}
      </button>
      
      {showDropdown && (
        <div className="announcement-dropdown" style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          width: '280px',
          maxHeight: '320px',
          overflow: 'auto',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 1000,
          marginTop: '8px'
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #eee',
            fontWeight: 600,
            fontSize: '14px'
          }}>
            📢 通知公告
          </div>
          
          {announcements.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              暂无通知
            </div>
          ) : (
            announcements.map(ann => (
              <div 
                key={ann.id}
                onClick={() => !ann.read && markAsRead(ann.id)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f5f5f5',
                  background: ann.read ? 'white' : '#fff8f0',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
                  {ann.read ? '' : '🆕 '}{ann.title}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  {ann.content.slice(0, 50)}...
                </div>
                <div style={{ fontSize: '11px', color: '#999' }}>
                  {new Date(ann.created_at).toLocaleDateString('zh-CN')}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
