
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function testBackend() {
    console.log("Starting Backend Server...");
    const server = spawn('node', ['backend/server.js'], {
        env: { ...process.env, PORT: '10001', SUPABASE_URL: 'https://mock.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'mock' },
        stdio: 'pipe'
    });

    server.stdout.on('data', (data) => console.log(`[Server]: ${data}`));
    server.stderr.on('data', (data) => console.error(`[Server Error]: ${data}`));

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
        console.log("Testing Health endpoint...");
        const healthRes = await fetch('http://localhost:10001/');
        const healthData = await healthRes.json();
        console.log("Health Check:", healthData);

        if (healthData.status !== "API running") throw new Error("Health check failed");

        console.log("Testing Upload endpoint (Mock File)...");
        const formData = new FormData();
        const csvContent = "sender_id,receiver_id,amount,timestamp\nuser1,user2,100,2023-01-01T00:00:00Z\nuser2,user3,200,2023-01-01T01:00:00Z";
        const file = new Blob([csvContent], { type: 'text/csv' });
        formData.append('file', file, 'test.csv');

        // Note: fetch in Node (v18+) supports FormData if recent enough, otherwise custom boundary.
        // If this fails due to environment, we might need 'undici' or 'form-data' package.
        // But let's try standard fetch first. 
        // Actually, Node's global Request/Response/FormData might differ.
        // Easier to write a simplified test that just hits health check, or rely on manual verify.
        // But I want to "check all functions".

    } catch (error) {
        console.error("Verification failed:", error);
    } finally {
        server.kill();
    }
}

testBackend();
