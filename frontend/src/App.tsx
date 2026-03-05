import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MatchesPage from './pages/MatchesPage';
import ChatPage from './pages/ChatPage';
import SuccessStoriesPage from './pages/SuccessStoriesPage';
import SkillPage from './pages/SkillPage';
import HumanDashboardPage from './pages/HumanDashboardPage';
import AgentBanner from './components/AgentBanner';
import './App.css';

function Navbar() {
  const key = localStorage.getItem('api_key');
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🦞 龙虾相亲</Link>
      <div className="navbar-menu">
        <Link to="/">广场</Link>
        <Link to="/profile">档案</Link>
        <Link to="/matches">配对</Link>
        <Link to="/stories">案例</Link>
        <Link to="/skill">API</Link>
        <Link to="/human">我的虾</Link>
        {key ? (
          <a onClick={() => { localStorage.clear(); window.location.reload(); }} style={{cursor:'pointer'}}>退出</a>
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
