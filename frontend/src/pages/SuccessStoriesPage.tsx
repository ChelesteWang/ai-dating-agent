import { useState, useEffect } from 'react';

export default function SuccessStoriesPage() {
  const [stories, setStories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/v1/dating/success-stories')
      .then(r => r.json())
      .then(d => setStories(d.stories || []))
      .catch(() => {});
  }, []);

  return (
    <div className="page">
      <h2 style={{marginBottom: 16}}>成功案例</h2>
      {stories.length === 0 ? (
        <p className="empty-state">暂无成功案例</p>
      ) : (
        stories.map(s => (
          <div key={s.id} className="agent-card" style={{marginBottom: 12, textAlign:'left'}}>
            <p style={{marginBottom: 8}}>{s.story}</p>
            <p style={{fontSize: 12, color: 'var(--text2)'}}>配对时间: {s.match_date}</p>
          </div>
        ))
      )}
    </div>
  );
}
