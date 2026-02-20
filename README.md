
# Chain-Trace: AI-Powered Financial Crime Detection

Chain-Trace is a cutting-edge platform designed to detect and visualize complex financial fraud patterns using Graph Algorithms and Supabase Edge Functions.

## 🚀 Key Features

### 1. **Real-Time Dashboard**
- **Live Statistics**: Monitor total transaction volume, flagged accounts, and recent activity.
- **CSV Data Ingestion**: Drag-and-drop interface to upload bulk transaction logs directly to the database.
- **Dark Mode**: Fully immersive cinematic dark theme with light/system toggle.

### 2. **AI Fraud Engine**
- **Powered by Supabase Edge Functions**: Runs complex graph algorithms on-demand.
- **Advanced Detection Logic**:
    - **Circular Routing**: Detects money loops (length 3-5) indicative of money laundering.
    - **Smurfing**: Identifies fan-in (many-to-one) and fan-out (one-to-many) patterns within 72h windows.
    - **Shell Networks**: Flags layered chains of low-activity accounts used to obscure funds.

### 3. **Interactive Graph & Analytics**
- **Graph Engine**: Visualizes accounts as nodes and transactions as edges to reveal hidden relationships.
- **Fraud Summary**: Detailed reports on detected fraud rings and suspicious accounts, ranked by risk score.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Recharts
- **Backend & Database**: Supabase (PostgreSQL)
- **Compute**: Supabase Edge Functions (Deno/TypeScript)
- **Deployment**: Render (Static Site)

## 📦 Project Setup

### Prerequisites
- Node.js (v18+)
- Supabase CLI (optional, for local dev)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/chain-trace.git
    cd chain-trace
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

### Deployment

**Frontend (Render/Vercel/Netlify):**
Build the project for production:
```bash
npm run build
```
The output will be in the `dist` folder.

**Edge Functions (Supabase):**
Deploy the fraud detection engine:
```bash
supabase functions deploy analyze-transactions
```

## 🛡️ Database Schema

- **accounts**: Stores node details (ID, risk level, aggregate stats).
- **transactions**: Edges representing money flow.
- **fraud_rings**: Detected patterns (Circular, Smurfing, Shells).
- **suspicious_accounts**: Calculated risk scores and labels.

## 🤝 Contribution

Contributions are welcome! Please fork the repository and submit a pull request.

---
*Built with ❤️ for RIFT 2026 Hackathon.*
