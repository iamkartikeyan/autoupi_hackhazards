import { Request, Response } from 'express';
import * as adminService from '../services/admin.service';

export async function getStats(req: Request, res: Response) {
  try {
    const stats = await adminService.getAdminStats();
    res.json({ success: true, data: stats, timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, timestamp: new Date().toISOString() });
  }
}

export async function getPools(req: Request, res: Response) {
  try {
    const pools = await adminService.getLiquidityPools();
    res.json({ success: true, data: pools, timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, timestamp: new Date().toISOString() });
  }
}

export async function rebalancePool(req: Request, res: Response) {
  try {
    const { currency, amount } = req.body;
    const pool = await adminService.rebalancePool(currency, parseFloat(amount));
    res.json({ success: true, data: pool, message: 'Pool rebalanced', timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, timestamp: new Date().toISOString() });
  }
}

export async function getAllTransactions(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await adminService.getAllTransactions(page, limit);
    res.json({ success: true, data: result, timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, timestamp: new Date().toISOString() });
  }
}

export async function getAllUsers(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await adminService.getAllUsers(page, limit);
    res.json({ success: true, data: result, timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, timestamp: new Date().toISOString() });
  }
}

export async function getRates(req: Request, res: Response) {
  const rates = adminService.getExchangeRates();
  res.json({ success: true, data: rates, timestamp: new Date().toISOString() });
}
