'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowRight, Phone, Mail, User, Shield, Zap, Globe, CheckCircle, ChevronLeft, KeyRound, Smartphone } from 'lucide-react';
import { authApi, saveAuthData, isAuthenticated } from '@/lib/api';
import BrandLogo from '@/components/ui/BrandLogo';

const FEATURES = [
  { icon: Zap, label: '8-second settlement', color: 'text-yellow-400' },
  { icon: Shield, label: 'Bank-grade security', color: 'text-blue-400' },
  { icon: Globe, label: 'Multi-currency support', color: 'text-green-400' },
];

const DEMO_CREDENTIALS = { phone: '+911234567890', email: 'demo@autoupi.com', name: 'Demo User', otp: '123456', password: 'password123' };

type AuthType = 'login' | 'signup';
type AuthMethod = 'otp' | 'password';
type Step = 'details' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthType>('login');
  const [method, setMethod] = useState<AuthMethod>('otp');
  const [step, setStep] = useState<Step>('details');
  const [loading, setLoading] = useState(false);
  
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isAuthenticated()) router.push('/dashboard');
  }, [router]);

  useEffect(() => {
    if (timer > 0) {
      const id = setTimeout(() => setTimer(t => t - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [timer]);

  function switchMode(m: AuthType) {
    setMode(m);
    setStep('details');
    resetFields();
  }

  function switchMethod(m: AuthMethod) {
    setMethod(m);
    setStep('details');
    resetFields();
  }

  function resetFields() {
    setPhone('');
    setEmail('');
    setFullName('');
    setPassword('');
    setOtp(['', '', '', '', '', '']);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone || phone.length < 10) return toast.error('Enter a valid phone number');
    
    // OTP Flow
    if (method === 'otp') {
      if (mode === 'signup' && !fullName.trim()) return toast.error('Full name is required');
      setLoading(true);
      try {
        await authApi.requestOTP(phone, email);
        setStep('otp');
        setTimer(60);
        toast.success(mode === 'signup' ? 'OTP sent! Verify to create your account.' : 'OTP sent! (Demo: 123456)');
        setTimeout(() => otpRefs.current[0]?.focus(), 300);
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to send OTP');
      } finally {
        setLoading(false);
      }
    } 
    // Password Flow
    else {
      if (mode === 'signup') {
        if (!fullName.trim()) return toast.error('Full name is required');
        if (password.length < 6) return toast.error('Password must be at least 6 characters');
        setLoading(true);
        try {
          const res = await authApi.registerPassword(phone, email, fullName, password);
          const { token, user } = res.data.data;
          saveAuthData(token, user);
          toast.success(`Welcome to AutoUPI, ${user.full_name}! 🎉`);
          setTimeout(() => router.push(user.role === 'ADMIN' ? '/admin' : '/send'), 500);
        } catch (err: any) {
          toast.error(err.response?.data?.error || 'Failed to create account');
        } finally {
          setLoading(false);
        }
      } else {
        if (!password) return toast.error('Password is required');
        setLoading(true);
        try {
          const res = await authApi.loginPassword(phone, password);
          const { token, user } = res.data.data;
          saveAuthData(token, user);
          toast.success('Welcome back! 🚀');
          setTimeout(() => router.push(user.role === 'ADMIN' ? '/admin' : '/send'), 500);
        } catch (err: any) {
          toast.error(err.response?.data?.error || 'Invalid credentials');
        } finally {
          setLoading(false);
        }
      }
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length < 6) return toast.error('Enter 6-digit OTP');
    setLoading(true);
    try {
      const res = await authApi.verifyOTP(phone, email, fullName, otpStr);
      const { token, user } = res.data.data;
      saveAuthData(token, user);
      toast.success(mode === 'signup' ? `Welcome to AutoUPI, ${user.full_name}! 🎉` : 'Welcome back! 🚀');
      setTimeout(() => router.push(user.role === 'ADMIN' ? '/admin' : '/send'), 500);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function fillDemo() {
    setPhone(DEMO_CREDENTIALS.phone);
    setEmail(DEMO_CREDENTIALS.email);
    setFullName(DEMO_CREDENTIALS.name);
    if (method === 'password') setPassword(DEMO_CREDENTIALS.password);
    toast('Demo credentials filled!', { icon: '✨' });
  }

  return (
    <div className="min-h-screen flex overflow-hidden bg-slate-950">
      {/* Left - Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-slate-900 to-accent-700/50" />
        <div className="absolute inset-0 bg-noise opacity-30" />
        <div className="absolute top-20 left-20 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

        <div className="relative z-10">
          <BrandLogo className="mb-16" size={44} priority textClassName="text-2xl font-bold text-white tracking-tight" />
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-5xl font-bold text-white leading-tight mb-6 text-balance">
              Cross-Border Payments in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-accent-300">
                8 Seconds
              </span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-10">
              Send money internationally with UPI-level speed. 1% fees. Real-time tracking. Bank-grade security.
            </p>
            <div className="space-y-4">
              {FEATURES.map((f, i) => (
                <motion.div key={f.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <f.icon className={`w-4 h-4 ${f.color}`} />
                  </div>
                  <span className="text-slate-200 font-medium">{f.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { value: '8s', label: 'Settlement' },
            { value: '1%', label: 'Fees' },
            { value: '99.7%', label: 'Success rate' },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-white num">{s.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right - Auth Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md my-auto flex flex-col pt-8 pb-12">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-10">
            <BrandLogo size={36} priority textClassName="text-xl font-bold text-white" />
          </div>

          <AnimatePresence mode="wait">
            {step === 'details' ? (
              <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>

                {/* Mode Toggle (Login / Signup) */}
                <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 mb-6">
                  <button
                    onClick={() => switchMode('login')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      mode === 'login' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => switchMode('signup')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      mode === 'signup' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {mode === 'login' ? 'Welcome back' : 'Create Account'}
                  </h2>
                  <p className="text-slate-400">
                    {mode === 'login' ? 'Sign in to continue to AutoUPI' : 'Start sending money in seconds'}
                  </p>
                </div>

                {/* Method Toggle (OTP / Password) */}
                <div className="flex gap-4 mb-8">
                  <button
                    onClick={() => switchMethod('otp')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                      method === 'otp' ? 'border-primary-500 bg-primary-500/10 text-primary-300' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" /> OTP Login
                  </button>
                  <button
                    onClick={() => switchMethod('password')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                      method === 'password' ? 'border-primary-500 bg-primary-500/10 text-primary-300' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <KeyRound className="w-4 h-4" /> Password
                  </button>
                </div>

                {/* Demo banner */}
                <button
                  onClick={fillDemo}
                  className="w-full mb-6 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-medium flex items-center justify-between hover:bg-white/10 transition-colors"
                >
                  <span>✨ Fill Demo Credentials</span>
                  {method === 'otp' ? <span className="text-xs text-slate-500">OTP: 123456</span> : <span className="text-xs text-slate-500">Pass: password123</span>}
                </button>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {/* Phone Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Email {mode === 'login' ? '(optional)' : '*'}</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required={mode === 'signup'}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
                      />
                    </div>
                  </div>

                  {/* Full Name Input (Signup only) */}
                  <AnimatePresence>
                    {mode === 'signup' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="pt-1">
                          <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name *</label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                              type="text"
                              value={fullName}
                              onChange={e => setFullName(e.target.value)}
                              placeholder="Your full name"
                              required={mode === 'signup'}
                              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Password Input (Password method only) */}
                  <AnimatePresence>
                    {method === 'password' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="pt-1">
                          <label className="block text-sm font-medium text-slate-300 mb-1.5">Password *</label>
                          <div className="relative">
                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                              type="password"
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              placeholder="••••••••"
                              required={method === 'password'}
                              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 mt-4 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {method === 'otp' ? (mode === 'signup' ? 'Send OTP' : 'Send OTP') : (mode === 'signup' ? 'Create Account' : 'Sign In')}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <button onClick={() => setStep('details')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 text-sm transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                <div className="mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary-500/20 flex items-center justify-center mb-4">
                    <CheckCircle className="w-7 h-7 text-primary-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Verify OTP</h2>
                  <p className="text-slate-400 text-sm">
                    {mode === 'signup' ? 'Verify your phone to create your account' : 'Enter the 6-digit code sent to'}{' '}
                    <span className="text-slate-200 font-medium">{phone}</span>
                  </p>
                  <p className="text-primary-400 text-xs mt-1 font-mono">Demo mode: use 123456</p>
                </div>

                <form onSubmit={handleVerifyOTP} className="space-y-8">
                  <div className="flex gap-3 justify-center">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className="w-12 h-14 text-center text-xl font-bold text-white bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all num"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.join('').length < 6}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {mode === 'signup' ? 'Create My Account' : 'Verify & Login'} <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    {timer > 0 ? (
                      <span className="text-slate-500 text-sm num">Resend in {timer}s</span>
                    ) : (
                      <button type="button" onClick={handleFormSubmit} className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors">
                        Resend OTP
                      </button>
                    )}
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
