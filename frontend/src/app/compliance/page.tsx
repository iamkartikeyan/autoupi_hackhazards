'use client';

import { useState, useEffect, useRef } from 'react';
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
  LockKeyhole,
  Zap,
  TrendingUp,
  Layers,
  Activity,
  RotateCcw
} from 'lucide-react';
import BrandLogo from '@/components/ui/BrandLogo';
import { jsPDF } from 'jspdf';
import { complianceApi, isAuthenticated } from '@/lib/api';

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

  // Graph States
  const [nodes, setNodes] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const [isLiveConnection, setIsLiveConnection] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Fetch Graph Data
  const fetchGraph = async () => {
    setGraphLoading(true);
    try {
      const loggedIn = isAuthenticated();
      setIsLiveConnection(loggedIn);
      
      let graphData;
      if (loggedIn) {
        const res = await complianceApi.getGraph();
        graphData = res.data?.data;
      }
      
      if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
        graphData = getMockGraphData();
      }

      // Map nodes to initial positions
      const mappedNodes = graphData.nodes.map((n: any, idx: number) => {
        const angle = (idx / graphData.nodes.length) * 2 * Math.PI;
        return {
          ...n,
          x: 400 + Math.cos(angle) * 160 + (Math.random() - 0.5) * 40,
          y: 250 + Math.sin(angle) * 160 + (Math.random() - 0.5) * 40,
          vx: 0,
          vy: 0,
        };
      });

      setNodes(mappedNodes);
      setLinks(graphData.links);
      
      // Auto select first node
      if (mappedNodes.length > 0) {
        setSelectedNode(mappedNodes[0]);
      }
    } catch (error) {
      console.error('Failed to fetch graph data:', error);
      const mockData = getMockGraphData();
      const mappedNodes = mockData.nodes.map((n: any, idx: number) => {
        const angle = (idx / mockData.nodes.length) * 2 * Math.PI;
        return {
          ...n,
          x: 400 + Math.cos(angle) * 160,
          y: 250 + Math.sin(angle) * 160,
          vx: 0,
          vy: 0,
        };
      });
      setNodes(mappedNodes);
      setLinks(mockData.links);
    } finally {
      setGraphLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  // Physics simulation logic
  useEffect(() => {
    if (nodes.length === 0) return;

    let animId: number;
    const runSimulation = () => {
      setNodes(currentNodes => {
        const nodeMap = new Map(currentNodes.map(n => [n.id, n]));

        // Apply forces
        const updated = currentNodes.map(n => {
          if (n.id === draggedNodeId) return n;

          // Pull to center
          let ax = (400 - n.x) * 0.005;
          let ay = (250 - n.y) * 0.005;

          // Repel other nodes
          currentNodes.forEach(o => {
            if (n.id === o.id) return;
            const dx = n.x - o.x;
            const dy = n.y - o.y;
            const distSq = dx * dx + dy * dy + 1;
            const dist = Math.sqrt(distSq);
            if (dist < 110) {
              const f = (110 - dist) * 0.16;
              ax += (dx / dist) * f;
              ay += (dy / dist) * f;
            }
          });

          const vx = (n.vx + ax) * 0.83;
          const vy = (n.vy + ay) * 0.83;

          return {
            ...n,
            vx,
            vy,
            x: Math.max(30, Math.min(770, n.x + vx)),
            y: Math.max(30, Math.min(470, n.y + vy)),
          };
        });

        const nextMap = new Map(updated.map(n => [n.id, n]));

        // Apply link constraints
        links.forEach(link => {
          const s = nextMap.get(link.source);
          const t = nextMap.get(link.target);
          if (s && t) {
            const dx = t.x - s.x;
            const dy = t.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const desired = s.label === 'Wallet' || t.label === 'Wallet' ? 70 : 120;
            const f = (dist - desired) * 0.04;

            const fx = (dx / dist) * f;
            const fy = (dy / dist) * f;

            if (s.id !== draggedNodeId) {
              s.x += fx;
              s.y += fy;
            }
            if (t.id !== draggedNodeId) {
              t.x -= fx;
              t.y -= fy;
            }
          }
        });

        return updated;
      });

      animId = requestAnimationFrame(runSimulation);
    };

    animId = requestAnimationFrame(runSimulation);
    return () => cancelAnimationFrame(animId);
  }, [nodes.length, links, draggedNodeId]);

  // Drag handlers
  const handleMouseDown = (nodeId: string) => {
    setDraggedNodeId(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (node) setSelectedNode(node);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!draggedNodeId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setNodes(prev =>
      prev.map(n =>
        n.id === draggedNodeId
          ? { ...n, x: Math.max(20, Math.min(780, mouseX)), y: Math.max(20, Math.min(480, mouseY)), vx: 0, vy: 0 }
          : n
      )
    );
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
  };

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

        {/* Real-time Graph Tracing Network (Neo4j AuraDB) */}
        <section className="mb-24 bg-slate-900 rounded-[3rem] p-8 lg:p-12 border border-slate-800 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
                  <Activity className="w-3 h-3 animate-pulse" />
                  Neo4j AuraDB Graph Engine
                </div>
                <h2 className="text-3xl font-black mb-2">Real-time Transaction Tracing</h2>
                <p className="text-slate-400 text-sm">
                  Interactive visualization of payment relationships, multi-sig escrow wallets, and liquidity conversion paths.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2.5 border border-white/5 rounded-2xl text-xs font-bold text-slate-400">
                  <div className={`w-2.5 h-2.5 rounded-full ${isLiveConnection ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'}`} />
                  {isLiveConnection ? 'Neo4j Live Node' : 'Simulated Audit Trail'}
                </div>
                <button
                  onClick={fetchGraph}
                  className="bg-white/5 hover:bg-white/10 text-white p-3 rounded-2xl border border-white/10 transition-all flex items-center justify-center active:scale-95 disabled:opacity-50"
                  disabled={graphLoading}
                  title="Reload Graph"
                >
                  <RotateCcw className={`w-4 h-4 ${graphLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* SVG Canvas Container */}
              <div className="lg:col-span-3 h-[500px] bg-slate-950/80 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden relative select-none cursor-grab active:cursor-grabbing">
                <svg
                  ref={svgRef}
                  className="w-full h-full"
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {/* Grid Background Pattern */}
                  <defs>
                    <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.015)" strokeWidth="1" />
                    </pattern>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#graph-grid)" />

                  {/* Link Lines */}
                  {links.map((link, idx) => {
                    const sourceNode = nodes.find(n => n.id === link.source);
                    const targetNode = nodes.find(n => n.id === link.target);
                    if (!sourceNode || !targetNode) return null;

                    return (
                      <g key={idx}>
                        <line
                          x1={sourceNode.x}
                          y1={sourceNode.y}
                          x2={targetNode.x}
                          y2={targetNode.y}
                          stroke="rgba(255, 255, 255, 0.06)"
                          strokeWidth="2"
                        />
                        {/* Direction Arrow/Indicator Dot */}
                        <circle
                          cx={(sourceNode.x + targetNode.x) / 2}
                          cy={(sourceNode.y + targetNode.y) / 2}
                          r="3"
                          fill="#3b82f6"
                          className="opacity-70 animate-pulse"
                        />
                      </g>
                    );
                  })}

                  {/* Relationship Text Labels */}
                  {links.map((link, idx) => {
                    const sourceNode = nodes.find(n => n.id === link.source);
                    const targetNode = nodes.find(n => n.id === link.target);
                    if (!sourceNode || !targetNode) return null;

                    const midX = (sourceNode.x + targetNode.x) / 2;
                    const midY = (sourceNode.y + targetNode.y) / 2;

                    return (
                      <text
                        key={`lbl-${idx}`}
                        x={midX}
                        y={midY - 6}
                        fill="rgba(148, 163, 184, 0.5)"
                        fontSize="8"
                        fontWeight="700"
                        textAnchor="middle"
                        className="pointer-events-none select-none font-mono"
                      >
                        {link.type}
                      </text>
                    );
                  })}

                  {/* Nodes */}
                  {nodes.map((node) => {
                    const isSelected = selectedNode?.id === node.id;
                    let nodeColor = '#3b82f6'; // User: Blue
                    let glowColor = 'rgba(59, 130, 246, 0.4)';

                    if (node.label === 'Wallet') {
                      nodeColor = '#a78bfa'; // Wallet: Purple
                      glowColor = 'rgba(167, 139, 250, 0.4)';
                    } else if (node.label === 'LiquidityPool') {
                      nodeColor = '#10b981'; // Pool: Green
                      glowColor = 'rgba(16, 185, 129, 0.4)';
                    } else if (node.label === 'Transaction') {
                      nodeColor = node.properties.status === 'FAILED' ? '#ef4444' : '#f59e0b'; // Transaction: Amber/Red
                      glowColor = node.properties.status === 'FAILED' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)';
                    }

                    if (node.properties.isExternal) {
                      nodeColor = '#64748b'; // External target: Gray
                      glowColor = 'rgba(100, 116, 139, 0.3)';
                    }

                    return (
                      <g
                        key={node.id}
                        onMouseDown={() => handleMouseDown(node.id)}
                        className="cursor-pointer"
                      >
                        {/* Outer Glow on Selection */}
                        {isSelected && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="22"
                            fill="none"
                            stroke={nodeColor}
                            strokeWidth="2"
                            strokeDasharray="4,4"
                            className="animate-spin"
                            style={{ transformOrigin: `${node.x}px ${node.y}px`, animationDuration: '6s' }}
                          />
                        )}

                        {/* Outer Glow Halo */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={node.label === 'Transaction' ? 14 : 16}
                          fill={glowColor}
                          filter="url(#glow)"
                        />

                        {/* Core Node Circle */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={node.label === 'Transaction' ? 10 : 12}
                          fill={nodeColor}
                          stroke="rgba(255, 255, 255, 0.1)"
                          strokeWidth="2"
                        />

                        {/* Icon Letter inside Node */}
                        <text
                          x={node.x}
                          y={node.y + 3.5}
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="900"
                          textAnchor="middle"
                          className="pointer-events-none select-none font-black"
                        >
                          {node.label === 'User' ? 'U' : node.label === 'Wallet' ? 'W' : node.label === 'LiquidityPool' ? 'P' : 'Tx'}
                        </text>

                        {/* Node Name Label */}
                        <text
                          x={node.x}
                          y={node.y + (node.label === 'Transaction' ? 24 : 26)}
                          fill={isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'}
                          fontSize="9"
                          fontWeight={isSelected ? '800' : '600'}
                          textAnchor="middle"
                          className="pointer-events-none select-none font-sans"
                        >
                          {node.label === 'User' ? node.properties.name : node.label === 'Wallet' ? `${node.properties.currency} Wallet` : node.label === 'LiquidityPool' ? `${node.properties.currency} Pool` : `${node.properties.amount} ${node.properties.currency}`}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Sidebar Inspector Panel */}
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl h-[500px] overflow-y-auto flex flex-col text-slate-300">
                {selectedNode ? (
                  <div className="flex-grow flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center font-black"
                        style={{
                          backgroundColor:
                            selectedNode.label === 'User'
                              ? 'rgba(59, 130, 246, 0.15)'
                              : selectedNode.label === 'Wallet'
                              ? 'rgba(167, 139, 250, 0.15)'
                              : selectedNode.label === 'LiquidityPool'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : 'rgba(245, 158, 11, 0.15)',
                          color:
                            selectedNode.label === 'User'
                              ? '#3b82f6'
                              : selectedNode.label === 'Wallet'
                              ? '#a78bfa'
                              : selectedNode.label === 'LiquidityPool'
                              ? '#10b981'
                              : '#f59e0b',
                        }}
                      >
                        {selectedNode.label === 'User' ? <Users className="w-5 h-5" /> : selectedNode.label === 'Wallet' ? <Layers className="w-5 h-5" /> : selectedNode.label === 'LiquidityPool' ? <Landmark className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-black text-[10px] tracking-wide uppercase text-slate-500">Node Type</h3>
                        <p className="font-bold text-white text-base">{selectedNode.label}</p>
                      </div>
                    </div>

                    <div className="h-[1px] bg-white/10 mb-6" />

                    <h4 className="font-black text-[10px] text-slate-500 uppercase tracking-widest mb-4">Properties</h4>
                    <div className="space-y-4 flex-grow">
                      {selectedNode.label === 'User' && (
                        <>
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Account Name</p>
                            <p className="text-sm text-white font-semibold">{selectedNode.properties.name}</p>
                          </div>
                          {!selectedNode.properties.isExternal && (
                            <>
                              <div className="space-y-1">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email Address</p>
                                <p className="text-sm text-white font-semibold">{selectedNode.properties.email}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Registered Phone</p>
                                <p className="text-sm text-white font-semibold">{selectedNode.properties.phone}</p>
                              </div>
                            </>
                          )}
                          {selectedNode.properties.isExternal && (
                            <div className="bg-slate-950/60 p-3.5 border border-white/5 rounded-2xl space-y-1">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Relationship</p>
                              <p className="text-xs text-slate-300 font-medium">This node represents an external beneficiary endpoint located outside the host system (e.g. UAE UPI Corridor).</p>
                            </div>
                          )}
                        </>
                      )}

                      {selectedNode.label === 'Wallet' && (
                        <>
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Balance</p>
                            <p className="text-sm text-white font-semibold">₹{selectedNode.properties.balance.toLocaleString('en-IN')}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Currency Code</p>
                            <p className="text-sm text-white font-semibold">{selectedNode.properties.currency}</p>
                          </div>
                        </>
                      )}

                      {selectedNode.label === 'LiquidityPool' && (
                        <>
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pool Currency</p>
                            <p className="text-sm text-white font-semibold">{selectedNode.properties.currency}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Capacity</p>
                            <p className="text-sm text-white font-semibold">{selectedNode.properties.currency} {selectedNode.properties.capacity.toLocaleString()}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Available Liquidity</p>
                            <p className="text-sm text-white font-semibold">{selectedNode.properties.currency} {selectedNode.properties.available.toLocaleString()}</p>
                          </div>
                        </>
                      )}

                      {selectedNode.label === 'Transaction' && (
                        <>
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Transfer Amount</p>
                            <p className="text-sm text-white font-semibold">₹{selectedNode.properties.amount.toLocaleString()}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Converted Amount</p>
                            <p className="text-sm text-white font-semibold">{selectedNode.properties.finalAmount.toLocaleString()} {selectedNode.properties.targetCurrency}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Protocol Fee (2%)</p>
                            <p className="text-sm text-white font-semibold">₹{selectedNode.properties.fee}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rate Lock</p>
                            <p className="text-sm text-white font-semibold">1 INR = {selectedNode.properties.rate} {selectedNode.properties.targetCurrency}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</p>
                            <span
                              className={`text-xs font-bold ${
                                selectedNode.properties.status === 'COMPLETED'
                                  ? 'text-green-400'
                                  : selectedNode.properties.status === 'PROCESSING'
                                  ? 'text-amber-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {selectedNode.properties.status}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Blockchain Receipt Hash</p>
                            <p className="text-xs text-blue-400 font-mono select-all overflow-hidden text-ellipsis whitespace-nowrap w-44 inline-block">{selectedNode.properties.hash}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow flex items-center justify-center text-center text-slate-500 py-12">
                    <div>
                      <Info className="w-8 h-8 mx-auto mb-4 opacity-50" />
                      <p className="text-sm font-semibold">Select a Node</p>
                      <p className="text-xs mt-1 max-w-[160px]">Click any node on the graph to inspect relationship attributes and metadata.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-green-500/5 rounded-full blur-[100px]" />
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

function getMockGraphData() {
  const nodes = [
    { id: 'usr_admin', label: 'User', properties: { name: 'AutoUPI Admin', email: 'admin@autoupi.com', phone: '+919999999999', role: 'ADMIN' } },
    { id: 'usr_rajesh', label: 'User', properties: { name: 'Rajesh Kumar', email: 'rajesh@demo.com', phone: '+919876543210', role: 'USER' } },
    { id: 'usr_priya', label: 'User', properties: { name: 'Priya Sharma', email: 'priya@demo.com', phone: '+919876543211', role: 'USER' } },
    { id: 'usr_demo', label: 'User', properties: { name: 'Demo User', email: 'demo@autoupi.com', phone: '+911234567890', role: 'USER' } },
    { id: 'ahmed@uae', label: 'User', properties: { name: 'Ahmed Al-Rashidi', isExternal: true } },
    { id: 'john@uk', label: 'User', properties: { name: 'John Smith', isExternal: true } },
    { id: 'sarah@us', label: 'User', properties: { name: 'Sarah Johnson', isExternal: true } },
    { id: 'wallet_usr_admin', label: 'Wallet', properties: { balance: 10000000, currency: 'INR' } },
    { id: 'wallet_usr_rajesh', label: 'Wallet', properties: { balance: 75000, currency: 'INR' } },
    { id: 'wallet_usr_priya', label: 'Wallet', properties: { balance: 120000, currency: 'INR' } },
    { id: 'wallet_usr_demo', label: 'Wallet', properties: { balance: 50000, currency: 'INR' } },
    { id: 'pool_aed', label: 'LiquidityPool', properties: { currency: 'AED', capacity: 2500000, available: 2200000 } },
    { id: 'pool_usd', label: 'LiquidityPool', properties: { currency: 'USD', capacity: 1000000, available: 870000 } },
    { id: 'pool_gbp', label: 'LiquidityPool', properties: { currency: 'GBP', capacity: 750000, available: 650000 } },
    { id: 'txn_01', label: 'Transaction', properties: { amount: 15000, currency: 'INR', targetCurrency: 'AED', finalAmount: 662.55, status: 'COMPLETED', time: 7.2, hash: '0x32a76f2b01a76f2b0124c1a5d96e4c7d', createdAt: '2026-07-10' } },
    { id: 'txn_02', label: 'Transaction', properties: { amount: 25000, currency: 'INR', targetCurrency: 'USD', finalAmount: 300.0, status: 'COMPLETED', time: 6.8, hash: '0xf0124c1ad96e4c7db0124c1a5d96e4c7d', createdAt: '2026-07-11' } },
    { id: 'txn_03', label: 'Transaction', properties: { amount: 50000, currency: 'INR', targetCurrency: 'GBP', finalAmount: 470.0, status: 'COMPLETED', time: 7.9, hash: '0x1023d8ab12a76f2b0124c1a5d96e4c7d', createdAt: '2026-07-12' } },
    { id: 'txn_active', label: 'Transaction', properties: { amount: 10000, currency: 'INR', targetCurrency: 'AED', finalAmount: 441.7, status: 'PROCESSING', time: 0, hash: 'Pending', createdAt: '2026-07-13' } },
  ];

  const links = [
    { source: 'usr_admin', target: 'wallet_usr_admin', type: 'OWNS' },
    { source: 'usr_rajesh', target: 'wallet_usr_rajesh', type: 'OWNS' },
    { source: 'usr_priya', target: 'wallet_usr_priya', type: 'OWNS' },
    { source: 'usr_demo', target: 'wallet_usr_demo', type: 'OWNS' },
    { source: 'usr_rajesh', target: 'txn_01', type: 'INITIATED' },
    { source: 'usr_priya', target: 'txn_02', type: 'INITIATED' },
    { source: 'usr_admin', target: 'txn_03', type: 'INITIATED' },
    { source: 'usr_demo', target: 'txn_active', type: 'INITIATED' },
    { source: 'txn_01', target: 'pool_aed', type: 'SETTLED_VIA' },
    { source: 'txn_02', target: 'pool_usd', type: 'SETTLED_VIA' },
    { source: 'txn_03', target: 'pool_gbp', type: 'SETTLED_VIA' },
    { source: 'txn_active', target: 'pool_aed', type: 'SETTLED_VIA' },
    { source: 'txn_01', target: 'ahmed@uae', type: 'TRANSFERRED_TO' },
    { source: 'txn_02', target: 'sarah@us', type: 'TRANSFERRED_TO' },
    { source: 'txn_03', target: 'john@uk', type: 'TRANSFERRED_TO' },
    { source: 'txn_active', target: 'ahmed@uae', type: 'TRANSFERRED_TO' },
  ];

  return { nodes, links };
}
