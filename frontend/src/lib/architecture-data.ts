import { 
  Smartphone, 
  RotateCcw, 
  Building2, 
  Globe, 
  Link as LinkIcon, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  ArrowRightLeft
} from 'lucide-react';

export interface ArchitectureNodeData {
  id: string;
  name: string;
  icon: any;
  position: [number, number, number];
  color: string;
  size: number;
  info: {
    title: string;
    description: string;
    time: string;
    compliance: string;
    safety: string;
  };
}

export const ARCHITECTURE_NODES: ArchitectureNodeData[] = [
  {
    id: 'sender',
    name: 'Sender (India)',
    icon: Smartphone,
    position: [-12, 0, 0],
    color: '#2563EB',
    size: 1.5,
    info: {
      title: '🇮🇳 Sender (India)',
      description: 'User initiates payment via familiar UPI apps (PhonePe, GPay, Paytm).',
      time: '0-5s',
      compliance: 'KYC verified via UPI',
      safety: 'UPI PIN + Device Auth'
    }
  },
  {
    id: 'upi',
    name: 'UPI Gateway',
    icon: RotateCcw,
    position: [-7, 0, 3],
    color: '#7C3AED',
    size: 1.2,
    info: {
      title: '🔄 UPI Gateway',
      description: 'Payment routed through NPCI UPI infrastructure.',
      time: '5-10s',
      compliance: 'RBI Payment Systems Act',
      safety: 'E2E Encryption + Fraud Detection'
    }
  },
  {
    id: 'bank',
    name: 'Partner Bank',
    icon: Building2,
    position: [-2, 0, 0],
    color: '#10B981',
    size: 2.0,
    info: {
      title: '🏦 Partner Bank (TBD Mint)',
      description: 'Bank locks reserve and mints Tokenized Bank Deposits (1 Token = ₹1).',
      time: '10-18s',
      compliance: 'RBI Sandbox Approved',
      safety: 'DICGC Insured (₹5 Lakh)'
    }
  },
  {
    id: 'gift',
    name: 'GIFT City IFSC',
    icon: Globe,
    position: [3, 0, -3],
    color: '#F59E0B',
    size: 1.8,
    info: {
      title: '🌐 GIFT City IFSC',
      description: 'Real-time FX conversion (₹ → $) at institutional rates.',
      time: '18-25s',
      compliance: 'FEMA Compliant, LRS Limits',
      safety: 'Licensed FX Dealer'
    }
  },
  {
    id: 'blockchain',
    name: 'Blockchain Layer',
    icon: LinkIcon,
    position: [8, 0, 0],
    color: '#06B6D4',
    size: 1.5,
    info: {
      title: '⛓️ Blockchain Settlement',
      description: 'Cross-border settlement on permissioned blockchain (Fiat-to-Fiat).',
      time: '25-32s',
      compliance: 'Not Crypto (Bank Deposits)',
      safety: 'Immutable Ledger + Audit Trail'
    }
  },
  {
    id: 'recipient',
    name: 'Recipient (USA)',
    icon: CheckCircle2,
    position: [13, 0, 0],
    color: '#2563EB',
    size: 1.5,
    info: {
      title: '🇺🇸 Recipient (USA)',
      description: "Local currency deposited in recipient's bank account instantly.",
      time: '32-40s',
      compliance: 'Local Banking Regulations',
      safety: 'FDIC Insured (USA)'
    }
  }
];

export const ANIMATION_STEPS = [
  { step: 0, name: 'Payment Initiated', duration: 5000, narration: 'User pays ₹10,000 via UPI...' },
  { step: 1, name: 'KYC/AML Check', duration: 5000, narration: 'KYC/AML checks completed instantly...' },
  { step: 2, name: 'TBD Token Mint', duration: 8000, narration: 'Bank mints 10,000 TBD Tokens (1 Token = ₹1)...' },
  { step: 3, name: 'Reserve Lock', duration: 7000, narration: 'Reserve locked with DICGC insurance...' },
  { step: 4, name: 'FX Conversion', duration: 7000, narration: 'FX conversion at GIFT City (₹83.50 = $1)...' },
  { step: 5, name: 'Blockchain Settlement', duration: 6000, narration: 'Blockchain settlement in progress...' },
  { step: 6, name: 'Recipient Receives', duration: 2000, narration: 'Recipient receives $120 in USA! ✅' }
];

export const SWIFT_STEPS = [
  { step: 0, name: 'Initiated', duration: 10000, narration: 'Day 1: Bank initiates wire transfer...' },
  { step: 1, name: 'Intermediary 1', duration: 10000, narration: 'Day 2: Correspondent Bank A processes...' },
  { step: 2, name: 'Intermediary 2', duration: 10000, narration: 'Day 3: Correspondent Bank B processes...' },
  { step: 3, name: 'Clearing', duration: 10000, narration: 'Day 4: Global clearing house delay...' },
  { step: 4, name: 'Received', duration: 2000, narration: 'Day 5: Recipient finally receives funds.' }
];
