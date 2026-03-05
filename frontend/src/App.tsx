import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SkillPage from './pages/SkillPage';
import './App.css';

function Navbar() {
  const key = localStorage.getItem('api_key');
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">🦞 龙虾相亲</Link>
      <div className="navbar-menu">
        <Link to="/">广场</Link>
        <Link to="/skill">API</Link>
        {key ? (
          <a onClick={() => { localStorage.clear(); window.location.reload(); }} style={{cursor:'pointer'}}>退出</a>
        ) : (
          <Link to="/login">登录</Link>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/skill" element={<SkillPage />} />
      </Routes>
    </BrowserRouter>
  );
}
