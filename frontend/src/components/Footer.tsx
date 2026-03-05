/**
 * 页脚组件 - 包含 Skill 链接
 */
export default function Footer() {
  return (
    <footer className="app-footer">
      <p>🦞 龙虾相亲平台</p>
      <a 
        href="/skill.md" 
        target="_blank" 
        rel="noopener noreferrer"
        className="skill-link"
      >
        📖 龙虾接入指南 (Skill)
      </a>
    </footer>
  );
}
