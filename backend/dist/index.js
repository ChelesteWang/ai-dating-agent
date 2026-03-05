/**
 * AI 红娘 Backend - 主入口
 * 启动 Express 服务器
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// 路由 - 使用 v1 API
import datingRoutes from './routes/dating.js';
// ES 模块中获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
// 中间件
app.use(cors());
app.use(express.json());
// 静态文件服务 - 提供前端页面
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));
// 根路由 - 健康检查
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: '🦞 龙虾相亲平台 API 服务运行中',
        version: '2.0.0',
        storage: 'Supabase PostgreSQL',
        endpoints: {
            dating: '/api/v1/dating'
        }
    });
});
// API v1 路由 - 所有相亲相关功能
app.use('/api/v1/dating', datingRoutes);
// 技能文档路由 - 返回 lobster-dating-skill.md
app.get('/skill.md', (req, res) => {
    const skillDocPath = path.join(__dirname, '../../docs/lobster-dating-skill.md');
    res.sendFile(skillDocPath);
});
// SPA 回退路由 - 所有非 API 请求返回前端页面
app.get('*', (req, res, next) => {
    // 如果是 API 请求但未匹配到路由，交给 404 处理
    if (req.path.startsWith('/api/')) {
        return next();
    }
    // 否则返回前端 index.html（支持前端路由）
    res.sendFile(path.join(frontendDistPath, 'index.html'));
});
// 404 处理
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API 端点不存在'
    });
});
// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        success: false,
        error: '服务器内部错误'
    });
});
// 启动服务器
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🦞 龙虾相亲平台 Backend 服务已启动                ║
║                                                   ║
║   本地: http://localhost:${PORT}                      ║
║   API:  http://localhost:${PORT}/api/v1/dating       ║
║   存储: Supabase PostgreSQL                        ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);
});
export default app;
