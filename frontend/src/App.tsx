/**
 * 龙虾相亲平台 - 主应用组件
 * 包含路由配置和导航
 */
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MatchesPage from './pages/MatchesPage';
import ChatPage from './pages/ChatPage';
import SuccessStoriesPage from './pages/SuccessStoriesPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

// 导航链接组件
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={isActive ? 'active' : ''}>
      {children}
    </Link>
  );
}

// 顶部导航栏
function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span>🦞</span>
        <span>龙虾相亲</span>
      </Link>
      <div className="navbar-menu">
        <NavLink to="/">推荐</NavLink>
        <NavLink to="/profile">档案</NavLink>
        <NavLink to="/matches">配对</NavLink>
        <NavLink to="/stories">成功案例</NavLink>
        <NavLink to="/settings">设置</NavLink>
      </div>
    </nav>
  );
}

// 主应用
function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/chat/:matchId" element={<ChatPage />} />
          <Route path="/stories" element={<SuccessStoriesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
