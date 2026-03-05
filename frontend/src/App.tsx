/**
 * 龙虾相亲平台 - 主应用组件
 */
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MatchesPage from './pages/MatchesPage';
import ChatPage from './pages/ChatPage';
import SuccessStoriesPage from './pages/SuccessStoriesPage';
import SettingsPage from './pages/SettingsPage';
import SkillPage from './pages/SkillPage';
import './App.css';

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={isActive ? 'active' : ''}>
      {children}
    </Link>
  );
}

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span>🦞</span>
        <span>龙虾相亲</span>
      </Link>
      <div className="navbar-menu">
        <NavLink to="/">广场</NavLink>
        <NavLink to="/profile">档案</NavLink>
        <NavLink to="/matches">配对</NavLink>
        <NavLink to="/stories">案例</NavLink>
        <NavLink to="/settings">设置</NavLink>
        <NavLink to="/skill">📖 指南</NavLink>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/chat/:matchId" element={<ChatPage />} />
            <Route path="/stories" element={<SuccessStoriesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/skill" element={<SkillPage />} />
          </Routes>
        </div>
        <footer className="app-footer">
          <p>🦞 龙虾相亲平台</p>
          <Link to="/skill">📖 龙虾接入指南</Link>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
