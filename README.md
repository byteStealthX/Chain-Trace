# 🔗 Chain-Trace

**Graph-Based Financial Crime Detection Engine**

Chain-Trace is a full-stack web application that detects money muling networks and financial fraud patterns through interactive graph visualization and intelligent transaction analysis.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase&logoColor=white)

---

## ✨ Features

- **CSV Upload** — Bulk import transaction data via drag-and-drop
- **Dashboard** — Real-time overview of transaction volumes, risk scores, and flagged accounts
- **Graph Visualization** — Interactive force-directed graph mapping account relationships and suspicious flows
- **Reports** — Filterable, sortable fraud report table with CSV export

## 🛠 Tech Stack

| Layer       | Technology                          |
| ----------- | ----------------------------------- |
| Frontend    | React 19, TypeScript, Vite          |
| Styling     | Tailwind CSS 4                      |
| Backend/DB  | Supabase (PostgreSQL, Auth, Storage)|
| Charts      | Recharts                            |
| Graph       | react-force-graph-2d                |
| CSV Parsing | PapaParse                           |
| Routing     | React Router v7                     |

## 📂 Folder Structure

```
src/
├── assets/          # Static assets (images, fonts)
├── components/
│   ├── layout/      # Navbar, Layout, Footer
│   └── ui/          # Button, Card, FileUpload, StatsCard
├── lib/             # Utilities & config (supabase.ts)
├── pages/           # Home, Dashboard, GraphView, Reports
├── types/           # Shared TypeScript interfaces
├── App.tsx          # Root component + Router
├── main.tsx         # Entry point
└── index.css        # Global styles + Tailwind
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- A [Supabase](https://supabase.com/) project (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/Chain-Trace.git
cd Chain-Trace

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Fill in your Supabase credentials in .env

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 📦 Scripts

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm run dev`     | Start dev server             |
| `npm run build`   | Production build             |
| `npm run preview` | Preview production build     |
| `npm run lint`    | Run ESLint                   |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the [MIT License](LICENSE).
