'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Mail, 
  Bell, 
  CheckCircle2, 
  Send as SendIcon, 
  Clock, 
  Phone,
  Wifi,
  Battery,
  Smartphone,
  ChevronLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  time: string;
  text: string;
  type: 'sms' | 'email' | 'push';
  status: 'delivered' | 'sent' | 'pending';
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  { id: '1', time: '0:05', text: '₹10,000 received - AutoUPI', type: 'sms', status: 'delivered' },
  { id: '2', time: '0:15', text: 'TBD Tokens minted - Bank Reserve Locked', type: 'sms', status: 'delivered' },
  { id: '3', time: '0:30', text: 'FX Done @ ₹83.50 = $1 | $120 sending', type: 'sms', status: 'delivered' },
  { id: '4', time: '0:45', text: 'Settlement in progress on blockchain', type: 'sms', status: 'sent' },
  { id: '5', time: '1:00', text: 'Recipient received $120 in USA! ✅', type: 'sms', status: 'sent' },
];

export default function NotificationPanel() {
  const [activeTab, setActiveTab] = useState<'sms' | 'email' | 'push'>('sms');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Initial load of first 3
    setNotifications(SAMPLE_NOTIFICATIONS.slice(0, 3));
  }, []);

  const triggerTest = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    toast.success('Twilio: Sending transaction update...');
    
    // Add 4th
    setTimeout(() => {
      setNotifications(prev => [...prev, SAMPLE_NOTIFICATIONS[3]]);
      toast('SMS: Settlement in progress...', { icon: '📱' });
    }, 1000);

    // Add 5th
    setTimeout(() => {
      setNotifications(prev => [...prev, { ...SAMPLE_NOTIFICATIONS[4], status: 'delivered' }]);
      toast.success('SMS: Recipient received $120!');
      setIsAnimating(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start max-w-6xl mx-auto py-12">
      {/* Left: Controls & Stats */}
      <div className="flex-1 space-y-8 w-full">
        <div>
          <h2 className="text-3xl font-black text-white mb-4">Real-time Alerts</h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            AutoUPI keeps everyone in the loop. From reserve locking to final payout, 
            receive instant updates via Twilio-powered SMS and Email.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 p-5 rounded-3xl">
            <div className="text-primary-400 font-bold mb-1 uppercase text-[10px] tracking-widest">Reliability</div>
            <div className="text-2xl font-black text-white">99.9%</div>
            <div className="text-xs text-slate-500">Uptime via Twilio</div>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 rounded-3xl">
            <div className="text-success-400 font-bold mb-1 uppercase text-[10px] tracking-widest">Latency</div>
            <div className="text-2xl font-black text-white">&lt;2s</div>
            <div className="text-xs text-slate-500">Delivery Speed</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'sms', icon: MessageSquare, label: 'SMS' },
            { id: 'email', icon: Mail, label: 'Email' },
            { id: 'push', icon: Bell, label: 'Push' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                activeTab === tab.id 
                ? 'bg-primary-500 text-white shadow-glow' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <button 
          onClick={triggerTest}
          disabled={isAnimating}
          className="w-full btn-primary !py-4 flex items-center justify-center gap-3 transition-transform active:scale-95 disabled:opacity-50"
        >
          <SendIcon className="w-5 h-5" />
          Send Test Notification
        </button>

        <div className="flex items-center gap-3 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Twilio-logo-red.png" alt="Twilio" className="h-4" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Powered by Twilio Messaging</span>
        </div>
      </div>

      {/* Right: iPhone Mockup */}
      <div className="relative">
        <div className="w-[320px] h-[650px] bg-slate-900 rounded-[3.5rem] border-[8px] border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
          {/* Status Bar */}
          <div className="h-10 px-8 flex items-center justify-between text-white pt-2">
            <span className="text-xs font-bold">9:41</span>
            <div className="flex gap-1.5 items-center">
              <Wifi size={12} />
              <Battery size={14} />
            </div>
          </div>

          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-800 rounded-b-3xl z-50 px-4 flex items-center justify-between">
             <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
             <div className="w-12 h-1 rounded-full bg-slate-700" />
          </div>

          <div className="flex-1 bg-slate-950 p-4 space-y-3 overflow-y-auto no-scrollbar">
            {/* App Header */}
            <div className="flex items-center gap-2 mb-6 text-slate-400">
              <ChevronLeft size={20} />
              <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                <Smartphone size={16} className="text-primary-400" />
              </div>
              <span className="font-bold text-sm text-slate-300">AutoUPI Alerts</span>
            </div>

            <AnimatePresence mode="popLayout">
              {notifications.map((n, idx) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: 50, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  layout
                  className="bg-slate-900 border border-white/5 rounded-2xl p-4 shadow-lg group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary-500" />
                  <div className="flex justify-between items-start mb-1 text-[10px]">
                    <span className="font-black text-slate-500 uppercase tracking-tighter">Message • {n.time}</span>
                    {n.status === 'delivered' ? (
                      <CheckCircle2 className="w-3 h-3 text-success-500" />
                    ) : (
                      <div className="w-3 h-3 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-200 leading-snug">
                    {n.text}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="h-16 bg-slate-900 border-t border-white/5 p-3 flex justify-around items-center">
             <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-glow" />
             <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
             <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  );
}
