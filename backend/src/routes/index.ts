import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import * as transactionController from '../controllers/transaction.controller';
import * as adminController from '../controllers/admin.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Auth routes
router.post('/auth/request-otp', authController.requestOTP);
router.post('/auth/verify-otp', authController.verifyOTP);
router.post('/auth/login', authController.loginPassword);
router.post('/auth/register', authController.registerPassword);
router.get('/auth/me', authMiddleware, authController.getMe);

// Transaction routes (protected)
router.post('/transactions/initiate', authMiddleware, transactionController.initiateTransaction);
router.get('/transactions/history', authMiddleware, transactionController.getHistory);
router.get('/transactions/:id', authMiddleware, transactionController.getTransaction);
router.get('/rates', transactionController.getRates);
router.get('/compliance/graph', authMiddleware, transactionController.getComplianceGraph);

// Admin routes (admin only)
router.get('/admin/stats', authMiddleware, adminMiddleware, adminController.getStats);
router.get('/admin/pools', authMiddleware, adminMiddleware, adminController.getPools);
router.post('/admin/pools/rebalance', authMiddleware, adminMiddleware, adminController.rebalancePool);
router.get('/admin/transactions', authMiddleware, adminMiddleware, adminController.getAllTransactions);
router.get('/admin/users', authMiddleware, adminMiddleware, adminController.getAllUsers);
router.get('/admin/rates', authMiddleware, adminMiddleware, adminController.getRates);

export default router;
