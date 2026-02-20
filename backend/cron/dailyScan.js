
import { analyzeFromDb } from '../services/fraudDetection.js';

console.log(`[${new Date().toISOString()}] Starting Daily Fraud Scan...`);

analyzeFromDb(24)
    .then(result => {
        console.log("Scan complete. Results:", JSON.stringify(result, null, 2));
        process.exit(0);
    })
    .catch(err => {
        console.error("Scan failed:", err);
        process.exit(1);
    });
