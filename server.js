import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';

// ---------------------------------------------------------------------------
// 1. Setup & Constants
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ---------------------------------------------------------------------------
// 2. Production Security & Optimization Middleware
// ---------------------------------------------------------------------------

// Security Headers
app.use(helmet({
    contentSecurityPolicy: false, // Disabled for simplicity with Vite/Supabase scripts
    crossOriginEmbedderPolicy: false
}));

// CORS Configuration
app.use(cors({
    origin: NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*', // Allow all in dev, strict in prod if env set
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Gzip Compression
app.use(compression());

// JSON Body Parser (if needed for potential future API routes)
app.use(express.json());

// ---------------------------------------------------------------------------
// 3. Healthcheck Endpoints (Critical for Render Zero-Downtime Deploys)
// ---------------------------------------------------------------------------
app.get('/', (_req, res) => {
    // Root checkpoint for load balancers
    res.status(200).send('Chain-Trace API running');
});

app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        env: NODE_ENV,
        service: 'chain-trace-frontend-server'
    });
});

// ---------------------------------------------------------------------------
// 4. Static Assets & SPA Handling
// ---------------------------------------------------------------------------

// Serve static assets with long-term caching
app.use(
    '/assets',
    express.static(join(__dirname, 'dist', 'assets'), {
        maxAge: '1y',
        immutable: true,
    })
);

// Serve other static files
app.use(express.static(join(__dirname, 'dist')));

// SPA Fallback: Serve index.html for any unknown route (client-side routing)
app.get('*', (_req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// ---------------------------------------------------------------------------
// 5. Error Handling
// ---------------------------------------------------------------------------

// Log unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
});

// Log uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1); // Exit to restart container
});

// ---------------------------------------------------------------------------
// 6. Start Server
// ---------------------------------------------------------------------------
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    🚀 Server running!
    ------------------
    Local:      http://localhost:${PORT}
    Environment: ${NODE_ENV}
    Time:        ${new Date().toISOString()}
    ------------------
    `);
});
