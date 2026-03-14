# Live Note 🚀

A premium, full-stack, real-time collaborative notes application built with a futuristic aesthetic. Featuring AI-powered assistance, collaborative editing, and a social commenting system.

![Dashboard Preview](/C:/Users/priyanshi/.gemini/antigravity/brain/67084bb0-d9b3-4739-a9c8-abb603e93ef0/dashboard_with_notes_loaded_1773520780803.png)

## ✨ Features

- 🔐 **Advanced Multi-Provider Auth**: Google, Apple, Microsoft, GitHub, and X (Twitter) support with secure demo fallbacks.
- ✍️ **Real-Time Collaborative Editor**: Multiple users can edit the same document with live cursor tracking.
- 💬 **Social Comments**: In-app discussion threads with user avatars and timestamps.
- 🤖 **AI Assistant**: Instant summaries, action items, and chat support integrated into your notes.
- ⌨️ **Command Palette (Ctrl+K)**: Keyboard-first navigation for themes, note management, and layout toggles.
- 🎨 **Premium UI**: Glassmorphism, neon accents, and adaptive dark/light/midnight modes.
- 📱 **Mobile Optimized**: Responsive layout with drawer-based navigation.

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router), Tailwind CSS, Framer Motion, Zustand.
- **Backend**: Node.js, Express, Socket.io.
- **Database**: MongoDB (Persistent), Redis (Presence & Cursors).

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB & Redis running locally.

### 2. Installation
Clone the repository and install dependencies in both folders:

```bash
# Backend
cd node-server
npm install

# Frontend
cd next_client
npm install
```

### 3. Running the App
Use the provided batch files in the root for a quick start:
- Run `start-backend.bat`
- Run `start-frontend.bat`

Or run manually:
```bash
# Terminal 1 (Backend)
cd node-server
npm run dev

# Terminal 2 (Frontend)
cd next-client
npm run dev
```

## 📄 License
MIT
