import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export async function requestOTP(req: Request, res: Response) {
  try {
    const { phone, email } = req.body;
    if (!phone) return res.status(400).json({ success: false, error: 'Phone is required', timestamp: new Date().toISOString() });

    const result = await authService.requestOTP(phone, email || '');
    res.json({ success: true, data: result, timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, timestamp: new Date().toISOString() });
  }
}

export async function verifyOTP(req: Request, res: Response) {
  try {
    const { phone, email, fullName, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ success: false, error: 'Phone and OTP required', timestamp: new Date().toISOString() });

    const result = await authService.verifyOTPAndLogin(phone, email || '', fullName || '', otp);
    res.json({ success: true, data: result, timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(401).json({ success: false, error: err.message, timestamp: new Date().toISOString() });
  }
}

export async function getMe(req: Request, res: Response) {
  try {
    const user = await authService.getUserById(req.user!.id);
    res.json({ success: true, data: user, timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, timestamp: new Date().toISOString() });
  }
}

export async function loginPassword(req: Request, res: Response) {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ success: false, error: 'Phone and password required', timestamp: new Date().toISOString() });
    const result = await authService.loginWithPassword(phone, password);
    res.json({ success: true, data: result, timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(401).json({ success: false, error: err.message, timestamp: new Date().toISOString() });
  }
}

export async function registerPassword(req: Request, res: Response) {
  try {
    const { phone, email, fullName, password } = req.body;
    if (!phone || !password || !fullName) return res.status(400).json({ success: false, error: 'Phone, full name, and password required', timestamp: new Date().toISOString() });
    if (password.length < 6) return res.status(400).json({ success: false, error: 'Password must be at least 6 characters', timestamp: new Date().toISOString() });
    const result = await authService.registerWithPassword(phone, email || '', fullName, password);
    res.json({ success: true, data: result, timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message, timestamp: new Date().toISOString() });
  }
}
