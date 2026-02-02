# DomainHunter

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**Smart Domain Name Generator & Bulk Availability Checker SaaS.**

DomainHunter is a production-ready SaaS application designed to help users discover available domain names through advanced algorithmic generation and high-speed bulk availability checking.

![DomainHunter Preview](./docs/screenshot.png)

## Features

- 🧠 **Smart Generation** - Uses advanced phonetic, syllable, and compound strategies to create brandable names.
- ⚡ **Bulk Availability** - High-concurrency checking with Real-time SSE streaming updates.
- 🔒 **Secure Vault** - Client-side encryption for safe storage of Namecheap/GoDaddy API keys.
- 📊 **Virtualized Results** - Efficiently handles lists of 5,000+ domains with smooth scrolling.
- 💾 **Local Persistence** - Auto-saves projects and configurations to local storage.
- 🎨 **Premium UI** - Modern interface with multiple themes (Linear, Stripe, Notion).
- 📱 **Fully Responsive** - Optimized for all devices.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: SQLite (Dev) / PostgreSQL (Prod)
- **State**: Server Actions + React Hooks
- **Real-time**: Server-Sent Events (SSE)
- **Deployment**: PM2 + Nginx + Docker

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone repository
git clone https://github.com/fadyy2k/Domain-Hunter.git
cd Domain-Hunter

# Install dependencies
npm ci

# Setup database
npx prisma generate
npx prisma db push

# Start development
npm run dev
```

## Environment Variables

Create a `.env` file in the root:

```env
# Database
DATABASE_URL="file:./dev.db"

# Security (32-char random string)
ENCRYPTION_KEY="your-32-character-secret-key-here"

# Application Config
RDAP_TIMEOUT=5000
CHECK_CONCURRENCY=10
```

## Deployment

The application is optimized for deployment on VPS (Ubuntu/Debian) using PM2 and Nginx.

### PM2 Setup
```bash
# Production build
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
```

### Nginx Configuration (SSE Optimized)
Ensure your Nginx config handles Server-Sent Events correctly:
```nginx
location /api/check {
    proxy_buffering off;
    proxy_cache off;
    proxy_read_timeout 86400s;
    proxy_set_header X-Accel-Buffering no;
}
```

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate` | POST | Generate domain suggestions based on keywords |
| `/api/check` | POST | Stream availability results (SSE) |
| `/api/keys` | POST | Securely store registrar API keys |
| `/api/health` | GET | System health check |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server (Port 4003) |
| `npm run lint` | Run ESLint |

## License

MIT © [Fady](https://github.com/fadyy2k)
