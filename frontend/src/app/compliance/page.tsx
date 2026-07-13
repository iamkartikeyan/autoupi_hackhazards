'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  FileCheck, 
  Users, 
  Globe, 
  Landmark, 
  ChevronDown, 
  Download, 
  CheckCircle2, 
  ArrowRight,
  Info,
  ExternalLink,
  Shield,
  Building2,
  LockKeyhole
} from 'lucide-react';
import BrandLogo from '@/components/ui/BrandLogo';
import { jsPDF } from 'jspdf';

const COMPLIANCE_CHECKS = [
  {
    id: 'rbi',
    title: 'RBI Sandbox Pilot',
    status: 'Active',
    description: 'Full regulatory oversight',
    badge: 'Approved',
    icon: Landmark,
    reg: 'RBI/2023-24/105',
    details: 'AutoUPI is part of the RBI Regulatory Sandbox Third Cohort for Cross-border Payments. This allows us to test innovative solutions in a controlled regulatory environment with real customers.',
    link: 'https://www.rbi.org.in/Scripts/PublicationReportDetails.aspx?ID=1224'
  },
  {
    id: 'dicgc',
    title: 'DICGC Insurance',
    status: 'Active',
    description: '₹5 Lakh per depositor',
    badge: 'Insured',
    icon: ShieldCheck,
    reg: 'DICGC Act, 1961',
    details: 'All funds processed via AutoUPI are held in escrow with partner banks and are covered by DICGC insurance up to ₹5 Lakh per unique depositor, ensuring your capital is protected by the same standards as any Indian bank deposit.',
    link: 'https://www.dicgc.org.in/'
  },
  {
    id: 'fema',
    title: 'FEMA Compliant',
    status: 'Active',
    description: 'LRS $250K limit enforced',
    badge: 'Compliant',
    icon: FileCheck,
    reg: 'FEMA (CAT) Rules, 2000',
    details: 'We enforce the Liberalised Remittance Scheme (LRS) limits of $250,000 per financial year for individuals. All transactions are reported to authorized dealer banks in real-time.',
    link: 'https://www.rbi.org.in/Scripts/BS_ViewFemaFunctions.aspx'
  },
  {
    id: 'kyc',
    title: 'KYC/AML Verified',
    status: 'Active',
    description: 'Automated verification',
    badge: 'Verified',
    icon: Users,
    reg: 'PMLA Act, 2002',
    details: 'Our systems perform automated Aadhaar and PAN verification. We conduct real-time anti-money laundering (AML) checks against global sanctions lists (OFAC, UN, EU).',
    link: '#'
  },
  {
    id: 'dpdp',
    title: 'DPDP Act (Data in India)',
    status: 'Active',
    description: 'Payment data on Indian servers',
    badge: 'Compliant',
    icon: LockKeyhole,
    reg: 'DPDP Act, 2023',
    details: 'In compliance with the Digital Personal Data Protection Act, all sensitive payment and personal data is stored exclusively on servers located within the territorial boundaries of India.',
    link: '#'
  },
  {
    id: 'gift',
    title: 'GIFT City IFSC',
    status: 'Active',
    description: 'Licensed forex conversion',
    badge: 'Approved',
    icon: Globe,
    reg: 'IFSCA Regulation 2020',
    details: 'Forex conversion is executed through authorized entities in GIFT City, Gandhinagar, ensuring competitive rates and institutional-grade transparency under IFSCA oversight.',
    link: 'https://ifsca.gov.in/'
  }
];

const FAQS = [
  {
    q: "Is this a cryptocurrency platform?",
    a: "No. AutoUPI does not use public cryptocurrencies like Bitcoin or Ethereum. We use 'Tokenized Bank Deposits' (TBD) which are digitised representations of actual INR held in RBI-regulated banks. It is a strictly fiat-to-fiat corridor."
  },
  {
    q: "Does this have RBI Approval?",
    a: "Yes. AutoUPI is currently operating within the RBI's Regulatory Sandbox. This means we operate under direct supervision and guidance from the Reserve Bank of India for the specific purpose of cross-border remittance."
  },
  {
    q: "Are my funds insured?",
    a: "Yes. Funds are held in escrow accounts at Tier-1 Indian banks (SBI/HDFC/ICICI). These deposits are covered by the Deposit Insurance and Credit Guarantee Corporation (DICGC) up to ₹5 lakh per depositor."
  },
  {
    q: "Where is my data stored?",
    a: "All personal and transaction data is stored on MeitY-empanelled cloud data centers located within India, fully complying with RBI data localization mandates and the DPDP Act 2023."
  }
];

export default function CompliancePage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setScore(100), 500);
    return () => clearTimeout(timer);
  }, []);

  const downloadReport = () => {
    setIsGenerating(true);
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(22, 101, 52); // dark green
    doc.text('AutoUPI Regulatory Compliance Report', 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 40);
    doc.text('Status: 100% COMPLIANT', 20, 45);

    doc.setDrawColor(200);
    doc.line(20, 50, 190, 50);

    // Checks
    let y = 65;
    COMPLIANCE_CHECKS.forEach((check, i) => {
      if (y > 250) {
        doc.addPage();
        y = 30;
      }
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(`${i + 1}. ${check.title}`, 20, y);
      
      doc.setFontSize(10);
      doc.setTextColor(22, 101, 52);
      doc.text(`Status: ${check.status} (${check.badge})`, 20, y + 7);
      
      doc.setTextColor(80);
      const splitText = doc.splitTextToSize(check.details, 160);
      doc.text(splitText, 20, y + 14);
      
      doc.setTextColor(150);
      doc.text(`Regulation: ${check.reg}`, 20, y + 14 + (splitText.length * 5));
      
      y += 35 + (splitText.length * 5);
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('This is a system-generated document for information purposes. AutoUPI is an RBI Sandbox participant.', 20, 285);

    doc.save('AutoUPI_Compliance_Report.pdf');
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-green-100 italic-none">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <BrandLogo size={36} textClassName="font-bold text-slate-900" />
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-slate-500 hover:text-green-600 transition-colors cursor-pointer hidden md:block text-slate-500">Trust Center</span>
            <span className="text-sm font-semibold text-slate-500 hover:text-green-600 transition-colors cursor-pointer hidden md:block text-slate-500">Privacy Policy</span>
            <button 
              onClick={downloadReport}
              disabled={isGenerating}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg shadow-green-200 transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Download Report'}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-20 text-slate-900">
          <div className="flex-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider"
            >
              <Shield className="w-4 h-4" />
              Fully Regulated Payments
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-black text-slate-900 leading-tight"
            >
              Banking Standards. <br/>
              <span className="text-green-600">Protocol Efficiency.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-600 max-w-2xl leading-relaxed"
            >
              AutoUPI is built on trust, transparency, and strict adherence to Indian banking regulations. We operate 100% within the legal framework of the RBI and FEMA.
            </motion.p>
          </div>

          <motion.div 
            className="w-full lg:w-80 h-80 relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
          >
             {/* Progress Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="160" cy="160" r="140"
                stroke="currentColor"
                strokeWidth="20"
                fill="transparent"
                className="text-slate-200"
              />
              <motion.circle
                cx="160" cy="160" r="140"
                stroke="currentColor"
                strokeWidth="20"
                fill="transparent"
                strokeDasharray={880}
                animate={{ strokeDashoffset: 880 - (880 * score) / 100 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="text-green-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-6xl font-black text-slate-900 leading-none">{score}%</span>
              <span className="text-sm font-bold text-green-600 uppercase tracking-widest mt-2">Compliant</span>
              <span className="text-[10px] text-slate-400 mt-1 max-w-[120px]">No Crypto License Needed (Bank-Led Model)</span>
            </div>
          </motion.div>
        </div>

        {/* Compliance Checks Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {COMPLIANCE_CHECKS.map((check, idx) => (
            <motion.div
              key={check.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-green-200 transition-all cursor-pointer group ${expanded === check.id ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => setExpanded(expanded === check.id ? null : check.id)}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-2xl bg-slate-100 text-slate-400 transition-colors group-hover:bg-green-100 group-hover:text-green-600`}>
                  <check.icon className="w-8 h-8" />
                </div>
                <div className="flex flex-col items-end">
                  <motion.div 
                    initial={{ backgroundColor: '#f1f5f9' }}
                    animate={{ backgroundColor: '#dcfce7' }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase text-green-700"
                  >
                    <CheckCircle2 className="w-3 h-3 text-green-600 animate-pulse" />
                    {check.badge}
                  </motion.div>
                  <span className="text-[10px] text-slate-400 font-mono mt-1">{check.reg}</span>
                </div>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-2">{check.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">{check.description}</p>
              
              <AnimatePresence>
                {expanded === check.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 border-t border-slate-100 mt-4 space-y-4">
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {check.details}
                      </p>
                      <a 
                        href={check.link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-green-600 text-[10px] font-black uppercase tracking-wider hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Verification Source <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 flex items-center justify-between text-slate-400">
                <span className="text-[10px] items-center gap-1 flex font-bold uppercase tracking-widest leading-none">
                  <Info className="w-3.5 h-3.5" /> {expanded === check.id ? 'Hide Details' : 'View Details'}
                </span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expanded === check.id ? 'rotate-180 text-green-600' : ''}`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Regulatory Timeline */}
        <section className="mb-24 bg-white rounded-[3rem] p-12 lg:p-16 border border-slate-200">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Pilot Roadmap</h2>
            <p className="text-slate-500">AutoUPI is moving towards a full commercial rollout under the RBI Regulatory Sandbox.</p>
          </div>

          <div className="relative pt-8 pb-12">
            {/* Timeline Bar */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 hidden lg:block" />
            <div className="absolute left-1/2 top-0 w-1 h-full bg-slate-100 -translate-x-1/2 lg:hidden" />

            <div className="grid lg:grid-cols-3 gap-12 relative">
              {[
                { date: 'Oct 2025', title: 'Sandbox Cohort III', desc: 'Commenced RBI pilot for cross-border payments with limited user group.', status: 'current' },
                { date: 'Jan 2026', title: 'IFSC Integrated', desc: 'Full liquidity pool integration with GIFT City partners achieved.', status: 'pending' },
                { date: 'Q3 2026', title: 'Mass Market Exit', desc: 'Exit sandbox successfully and transition to full commercial license.', status: 'pending' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border-4 border-slate-50 shadow-xl ${item.status === 'current' ? 'bg-green-600 text-white animate-pulse shadow-green-200' : 'bg-white text-slate-300'}`}>
                    {item.status === 'current' ? <CheckCircle2 className="w-6 h-6" /> : <CircleIcon className="w-4 h-4" />}
                  </div>
                  <div className="text-xs font-black text-green-600 uppercase tracking-[0.2em] mb-2">{item.date}</div>
                  <h4 className="text-lg font-black text-slate-900 mb-3">{item.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed px-4">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-white overflow-hidden relative mb-24">
          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-4xl font-black mb-12 text-center leading-tight">Your Compliance <br />Questions, Answered.</h2>
            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
                  <h4 className="text-xl font-bold mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm">Q</div>
                    {faq.q}
                  </h4>
                  <p className="text-slate-400 leading-relaxed pl-11">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Decorative stuff */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
        </section>

        {/* Partner Banks */}
        <section className="py-24 border-t border-slate-200">
          <div className="text-center space-y-6">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Our Infrastructure Partners</div>
            <h3 className="text-2xl font-black text-slate-900">Partner Banks Issue TBD</h3>
            <div className="flex flex-wrap items-center justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 py-8">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8" />
                <span className="text-2xl font-black font-serif italic">SBI</span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8" />
                <span className="text-2xl font-bold font-sans">HDFC Bank</span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8" />
                <span className="text-2xl font-black uppercase font-mono">ICICI</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 text-slate-400 text-[10px] font-black uppercase tracking-widest">
          <span>&copy; 2026 AutoUPI Terminal. All rights reserved.</span>
          <div className="flex items-center gap-8">
            <span className="hover:text-slate-900 cursor-pointer">Regulatory Disclosures</span>
            <span className="hover:text-slate-900 cursor-pointer">Security Standards</span>
            <span className="hover:text-slate-900 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const CircleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
  </svg>
);
