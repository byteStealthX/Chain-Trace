import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import compression from 'compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ── Gzip compression ─────────────────────────────────────────────────
app.use(compression());

// ── Security headers ──────────────────────────────────────────────────
app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// ── Serve static assets with long-term caching ───────────────────────
app.use(
    '/assets',
    express.static(join(__dirname, 'dist', 'assets'), {
        maxAge: '1y',
        immutable: true,
    })
);

// ── Serve other static files ──────────────────────────────────────────
app.use(express.static(join(__dirname, 'dist')));

// ── SPA fallback — serve index.html for all other routes ──────────────
app.get('*', (_req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Chain-Trace running on port ${PORT}`);
});
