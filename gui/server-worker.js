const server = require('../server.js');

// Process communication
process.on('message', async (msg) => {
    if (msg.command === 'start') {
        try {
            // Forward logs to parent
            const config = await server.startServer((message) => {
                if (process.connected) process.send({ type: 'log', message });
            });

            if (process.connected) process.send({ type: 'started', config });
        } catch (error) {
            if (process.connected) process.send({ type: 'error', error: error.message });
        }
    } else if (msg.command === 'stop') {
        try {
            await server.stopServer();
            if (process.connected) process.send({ type: 'stopped' });
            process.exit(0);
        } catch (error) {
            if (process.connected) process.send({ type: 'error', error: error.message });
            process.exit(1);
        }
    }
});

// Handle unexpected errors
process.on('uncaughtException', (error) => {
    if (process.connected) process.send({ type: 'error', error: error.message });
});
