# Chain-Trace: AI-Powered Financial Crime Detection

Chain-Trace is a production-ready platform designed to detect and visualize complex financial fraud patterns using Graph Algorithms and a dedicated Node.js backend.

## 🏗️ Architecture

This project is split into two separate services for scalable deployment:

- **`/frontend`**: React (Vite) Single Page Application. Handles UI, visualization, and user interaction.
- **`/backend`**: Node.js (Express) API. Handles CSV parsing, fraud detection logic, and database operations.

## 🚀 Key Features

- **Real-Time Dashboard**: Monitor transaction volume, flagged accounts, and recent activity.
- **AI Fraud Engine**:
    - **Circular Routing**: Detects money loops (length 3-5).
    - **Smurfing**: Identifies fan-in/fan-out patterns (72h window).
    - **Shell Networks**: Flags layered chains of low-activity accounts.
- **Interactive Graph**: Visualizes accounts (nodes) and transactions (edges).
- **Backend API**: Robust CSV processing and fraud analysis endpoint.

## 🛠️ Local Setup

### 1. Prerequisites
- Node.js (v18+)
- Supabase Project (URL & Keys)

### 2. Backend Setup
Navigate to the backend directory:
```bash
cd backend
npm install
```

Create `backend/.env` file:
```env
PORT=10000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Start the server:
```bash
npm start
```
The server will run on `http://localhost:10000`.

### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd frontend
npm install
```

Create `frontend/.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_BASE_URL=http://localhost:10000
```

Start the development server:
```bash
npm run dev
```
Open `http://localhost:8080` (or the port shown) in your browser.

## ☁️ Deployment on Render

This project is configured for easy deployment on **Render.com**.

### 1. Backend Service (Web Service)
- **Name**: `chain-trace-backend`
- **Root Directory**: `backend`
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**:
    - `SUPABASE_URL`
    - `SUPABASE_SERVICE_ROLE_KEY`

### 2. Frontend Service (Static Site)
- **Name**: `chain-trace-frontend`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**:
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`
    - `VITE_API_BASE_URL` (Set to your deployed Backend URL, e.g., `https://chain-trace-backend.onrender.com`)

### ⚠️ Manual Configuration (Crucial for Deployment Success)

If you are **not** using the "Blueprint" feature (i.e. you created services manually):

1.  **Backend Service**:
    - Go to **Settings > Build & Deploy**.
    - Set **Root Directory** to `backend`. (Default is empty/root, which will fail!)
    - Set **Build Command** to `npm install`.
    - Set **Start Command** to `npm start`.

2.  **Frontend Service**:
    - Go to **Settings > Build & Deploy**.
    - Set **Root Directory** to `frontend`.
    - Set **Build Command** to `npm install && npm run build`.
    - Set **Publish Directory** to `dist`.

3.  **Cron Job (Optional)**:
    - Create a new **Cron Job**.
    - Set **Root Directory** to `backend`.
    - Set **Command** to `node cron/dailyScan.js`.
    - Schedule: `0 0 * * *`.


## 🛡️ API Reference

### `POST /api/upload`
Uploads a CSV file of transactions for analysis.
- **Body**: `multipart/form-data` with key `file`.
- **Response**: JSON object containing detected fraud rings, suspicious accounts, and graph data.

---
*Built for RIFT 2026 Hackathon.*
