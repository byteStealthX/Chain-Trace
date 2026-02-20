
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


console.log('Successfully imported modules');
const app = express();
const PORT = process.env.PORT || 3000;

console.log('App created');

// Serve static files from the dist directory
try {
    const distPath = path.join(__dirname, 'dist');
    console.log('Serving static files from:', distPath);
    app.use(express.static(distPath));
} catch (error) {
    console.error('Error setting up static files:', error);
}

// Health check endpoints (before wildcard route)
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

console.log('Wildcard route setup...');
// Wildcard route to serve index.html for client-side routing
try {
    app.get('/*', (_req, res) => {
        const indexPath = path.join(__dirname, 'dist', 'index.html');
        console.log('Sending index.html from:', indexPath);
        res.sendFile(indexPath);
    });
} catch (error) {
    console.error('Error setting up wildcard route:', error);
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
