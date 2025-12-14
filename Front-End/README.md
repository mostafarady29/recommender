# Insight Frontend

Academic research papers search and discovery platform - Frontend application.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
pnpm build
```

## 🛠️ Tech Stack

- **React 19** - UI framework
- **Vite 7** - Build tool
- **TypeScript** - Type safety
- **TailwindCSS 4** - Styling
- **Wouter** - Routing
- **Radix UI** - Component primitives
- **Lucide React** - Icons
- **Sonner** - Toast notifications

## 📁 Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utility functions
│   │   └── App.tsx         # Main app component
│   ├── public/             # Static assets
│   └── index.html
├── package.json
└── vite.config.ts
```

## 🌐 Environment Variables

Create a `.env.production` file:

```env
VITE_API_URL=https://your-backend-url.com/api
VITE_CHATBOT_URL=https://your-chatbot-url.com
```

## 📦 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repository in Vercel
3. Framework preset: **Vite**
4. Build command: `pnpm run build`
5. Output directory: `dist`
6. Add environment variables
7. Deploy!

### Other Platforms

The app is a standard Vite/React SPA and can be deployed to any static hosting service.

## 🔗 Related Repositories

- [Backend API](https://github.com/mostafarady29/insight_1.1) - Main repository with all services
- Backend: Node.js + Express + SQL Server
- Chatbot: Python + FastAPI + RAG

## 📝 License

MIT

## 👥 Team

Insight Team
