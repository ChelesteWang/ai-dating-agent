/**
 * AI 红娘 Backend - 主入口
 * 启动 Express 服务器
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 路由 - 使用 v1 API
import datingRoutes from './routes/dating.js';

// 初始化示例数据
import { initDemoData } from './services/datingService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// 中间件
app.use(cors());
app.use(express.json());

// 初始化示例数据（仅用于演示）
initDemoData();

// 根路由 - 健康检查
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '🦞 龙虾相亲平台 API 服务运行中',
    version: '1.0.0',
    endpoints: {
      dating: '/api/v1/dating'
    }
  });
});

// API v1 路由 - 所有相亲相关功能
app.use('/api/v1/dating', datingRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'API 端点不存在' 
  });
});

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);
});

export default app;
