/**
 * Skill Page - 直接渲染 skill.md
 */
import { useEffect, useState } from 'react';

export default function SkillPage() {
  const [content, setContent] = useState('');
  
  useEffect(() => {
    fetch('/skill.md')
      .then(res => res.text())
      .then(setContent)
      .catch(() => setContent('加载失败'));
  }, []);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
      {content}
    </div>
  );
}
