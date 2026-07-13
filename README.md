# ⚡ AutoUPI — Cross-Border Payments in 8 Seconds

<div align="center">

![AutoUPI Banner](https://img.shields.io/badge/AutoUPI-Cross--Border%20Payments-2563EB?style=for-the-badge&logo=lightning&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=for-the-badge&logo=socket.io)

**Send money internationally in 8 seconds. 2% fee. Real-time blockchain tracking.**

[🚀 Live Demo](#) · [📹 Demo Video](#) · [📄 Docs](#tech-stack)

</div>

---

## 🎯 Problem Statement

Traditional international wire transfers take **3–5 business days** and charge **3–7% in fees**. AutoUPI solves this using India's UPI infrastructure + a cross-border settlement layer to complete payments in under **8 seconds** with only **2% fee**.

---

## ✨ Features

- 🔐 **OTP-based Auth** — Phone + Email login with JWT sessions
- 💸 **Multi-Currency Support** — INR → AED, USD, EUR, GBP
- ⚡ **8-Second Settlement** — Real-time WebSocket pipeline tracking
- 📊 **Live Rate Ticker** — Exchange rates updated every second
- 🔗 **Blockchain Hash** — Every transaction gets an on-chain verification hash
- 📱 **Mobile-First UI** — OLED dark theme, Framer Motion animations
- 📜 **Transaction History** — Full paginated dashboard with stats
- 🛡️ **KYC + AML Pipeline** — Simulated compliance checking

---

## 🧱 Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| **Next.js 16** (App Router) | Framework |
| **TypeScript** | Type safety |
| **TailwindCSS** | Styling |
| **Framer Motion** | Animations |
| **Socket.io Client** | Real-time updates |
| **Axios** | API calls |
| **Lucide React** | Icons |
| **React Hot Toast** | Notifications |

### Backend
| Tech | Purpose |
|------|---------|
| **Express.js** | API server |
| **TypeScript** | Type safety |
| **Supabase** (PostgreSQL) | Database |
| **Socket.io** | WebSocket real-time |
| **JWT** | Authentication |
| **Twilio** | OTP/SMS (optional) |
| **Zod** | Request validation |
| **Helmet + Rate Limit** | Security |

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

### 1. Clone the repo
```bash
git clone https://github.com/iamkartikeyan/autoupi.git
cd autoupi
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your Supabase credentials in .env
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev
```

### 4. Open
```
Frontend → http://localhost:3000
Backend  → http://localhost:5000
```

### 5. Demo Login
Use these credentials to skip real OTP:
```
Phone:  +911234567890
Email:  demo@autoupi.com
Name:   Demo User
OTP:    123456
```

---

## 🗄️ Database Setup (Supabase)

1. Go to [supabase.com](https://supabase.com) → New Project
2. Run the SQL from `backend/src/utils/seed.ts` in the SQL editor
3. Copy your **SUPABASE_URL** and **SUPABASE_SERVICE_KEY** into `backend/.env`

---

## 📁 Project Structure

```
autoupi/
├── frontend/                 # Next.js App
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/        # OTP Auth
│   │   │   ├── send/         # Send Money
│   │   │   ├── process/      # Real-time Tracking
│   │   │   ├── success/      # Confirmation
│   │   │   ├── dashboard/    # History
│   │   │   └── compare/      # Bank Comparison
│   │   ├── components/ui/    # Shared Components
│   │   ├── lib/api.ts        # API Client
│   │   └── styles/           # Global CSS
│   └── .env.example
│
├── backend/                  # Express.js API
│   ├── src/
│   │   ├── routes/           # API Routes
│   │   ├── middleware/       # Auth, Rate limit
│   │   ├── config/           # Supabase config
│   │   └── utils/            # Helpers, Seed
│   └── .env.example
│
└── README.md
```

---

## 🌊 Transaction Flow

```
User enters amount → OTP Login → Payment initiated
       ↓
  KYC Check → AML Compliance → Rate Lock
       ↓
  Liquidity Pool → Cross-Border Settlement
       ↓
  Blockchain Hash → Recipient Notified → Done ✅
```

All steps visible in real-time via **WebSocket** on the Process page.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
JWT_SECRET=your-jwt-secret
DEMO_MODE=true
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

---

## 👨‍💻 Built By

**Kartikeyan Sahani** — Hackathon 2025

---

<div align="center">
  <b>AutoUPI · Powered by UPI + Blockchain</b><br/>
  <i>Making cross-border payments as fast as sending a WhatsApp message</i>
</div>
