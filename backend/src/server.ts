import http from 'http';
import { Server as SocketServer } from 'socket.io';
import app from './app';
import { testConnection } from './config/supabase';
import { setSocketServer } from './services/settlement.service';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function start() {
  // Test DB connection
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Cannot start server without database connection');
    process.exit(1);
  }

  const httpServer = http.createServer(app);

  // Socket.io setup
  const io = new SocketServer(httpServer, {
    cors: {
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'https://*.vercel.app',
      ],
      methods: ['GET', 'POST'],
    },
  });

  setSocketServer(io);

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on('join_transaction', (transactionId: string) => {
      socket.join(`txn_${transactionId}`);
      console.log(`Socket ${socket.id} joined txn_${transactionId}`);
    });

    socket.on('join_admin', () => {
      socket.join('admin');
      console.log(`Socket ${socket.id} joined admin room`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`
🚀 AutoUPI Backend Server Running
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 HTTP Server: http://localhost:${PORT}
🔌 WebSocket: ws://localhost:${PORT}
📊 Environment: ${process.env.NODE_ENV || 'development'}
⚡ Demo Mode: ${process.env.DEMO_MODE || 'false'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  });
}

start().catch(console.error);
