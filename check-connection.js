const net = require('net');

const ports = [587, 465];
const host = 'smtp.gmail.com';

console.log("🔍 Testing Network Connectivity to Gmail...");

ports.forEach(port => {
    console.log(`👉 Attempting to connect to ${host}:${port}...`);
    const socket = net.createConnection(port, host, () => {
        console.log(`✅ SUCCESS: Connected to ${host}:${port}`);
        socket.end();
    });

    socket.on('error', (err) => {
        console.log(`❌ FAILED: Could not connect to ${host}:${port} - ${err.message}`);
    });

    socket.setTimeout(5000, () => {
        console.log(`❌ TIMEOUT: ${host}:${port} took too long (likely firewall/ISP block)`);
        socket.destroy();
    });
});
