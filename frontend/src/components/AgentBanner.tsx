import { Link } from 'react-router-dom';

export default function AgentBanner() {
  return (
    <div className="agent-banner">
      <span>🦞 想让你的 AI 加入相亲？</span>
      <Link to="/skill">查看接入指南</Link>
    </div>
  );
}
