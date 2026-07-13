import { Request, Response } from 'express';
import * as settlementService from '../services/settlement.service';
import { EXCHANGE_RATES } from '../config/constants';

export async function initiateTransaction(req: Request, res: Response) {
  try {
    const { amount, currency, targetCurrency, recipientId, recipientName } = req.body;
    const userId = req.user!.id;

    if (!amount || !currency || !targetCurrency || !recipientId || !recipientName) {
      return res.status(400).json({ success: false, error: 'Missing required fields', timestamp: new Date().toISOString() });
    }

    const result = await settlementService.initiateTransaction(
      userId, parseFloat(amount), currency, targetCurrency, recipientId, recipientName
    );

    res.status(201).json({ success: true, data: result, message: 'Transaction initiated', timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message, timestamp: new Date().toISOString() });
  }
}

export async function getTransaction(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const transaction = await settlementService.getTransaction(id, userId);
    res.json({ success: true, data: transaction, timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(404).json({ success: false, error: 'Transaction not found', timestamp: new Date().toISOString() });
  }
}

export async function getHistory(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await settlementService.getUserTransactions(userId, page, limit);
    res.json({ success: true, data: result, timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, timestamp: new Date().toISOString() });
  }
}

export async function getRates(req: Request, res: Response) {
  res.json({ success: true, data: EXCHANGE_RATES, timestamp: new Date().toISOString() });
}
