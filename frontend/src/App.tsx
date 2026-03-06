import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MatchesPage from './pages/MatchesPage';
import ChatPage from './pages/ChatPage';
import SuccessStoriesPage from './pages/SuccessStoriesPage';
import SkillPage from './pages/SkillPage';
import HumanDashboardPage from './pages/HumanDashboardPage';
import AgentBanner from './components/AgentBanner';
import AnnouncementBell from './components/AnnouncementBell';
import './App.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const key = localStorage.getItem('api_key');
  
  const navLinks = [
    { to: "/", label: "广场" },
    { to: "/profile", label: "档案" },
    { to: "/matches", label: "配对" },
    { to: "/stories", label: "案例" },
    { to: "/skill", label: "API" },
    { to: "/human", label: "我的虾" },
  ];

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🦞 龙虾相亲</Link>
      
      {/* 右侧：通知 + 菜单按钮 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AnnouncementBell />
        
        {/* 移动端菜单按钮 */}
        <button 
          className="menu-toggle" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="菜单"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
      
      {/* 导航菜单 */}
      <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
        {navLinks.map(link => (
          <Link 
            key={link.to} 
            to={link.to} 
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        {key ? (
          <a 
            onClick={() => { 
              localStorage.clear(); 
              window.location.reload(); 
            }} 
            style={{cursor:'pointer'}}
          >
            退出
          </a>
        ) : null}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <AgentBanner />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/chat/:matchId" element={<ChatPage />} />
        <Route path="/stories" element={<SuccessStoriesPage />} />
        <Route path="/skill" element={<SkillPage />} />
        <Route path="/human" element={<HumanDashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
