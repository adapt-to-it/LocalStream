const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow;
let serverProcess = null;
let serverStatus = 'stopped'; // 'stopped', 'starting', 'running', 'stopping'
let currentConfig = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 600,
        minHeight: 500,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        },
        title: "LocalStream Server Control",
        autoHideMenuBar: true,
        icon: path.join(__dirname, '../public/favicon.ico')
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('server-status', { status: serverStatus, config: currentConfig });
    });
}

function sendLog(message) {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('server-log', message);
    }
}

function updateStatus(status, config = null) {
    serverStatus = status;
    if (config) currentConfig = config;
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('server-status', { status, config });
    }
}

// --- Server Management via Child Process ---

function startServerProcess() {
    return new Promise((resolve, reject) => {
        if (serverProcess) return resolve(currentConfig);

        const workerPath = path.join(__dirname, 'server-worker.js');
        serverProcess = fork(workerPath, [], {
            stdio: ['ignore', 'pipe', 'pipe', 'ipc']
        });

        // Handle stdio for debugging
        serverProcess.stdout.on('data', (data) => console.log(`[Server]: ${data}`));
        serverProcess.stderr.on('data', (data) => console.error(`[Server Error]: ${data}`));

        // Handle IPC messages from worker
        serverProcess.on('message', (msg) => {
            if (msg.type === 'log') {
                sendLog(msg.message);
            } else if (msg.type === 'started') {
                updateStatus('running', msg.config);
                resolve(msg.config);
            } else if (msg.type === 'stopped') {
                updateStatus('stopped');
                serverProcess = null;
            } else if (msg.type === 'error') {
                sendLog(`❌ Process Error: ${msg.error}`);
                updateStatus('stopped');
                serverProcess = null;
                reject(new Error(msg.error));
            }
        });

        serverProcess.on('exit', (code) => {
            if (code !== 0 && code !== null) {
                sendLog(`⚠️ Server process exited with code ${code}`);
                updateStatus('stopped');
            }
            serverProcess = null;
        });

        // Send start command
        serverProcess.send({ command: 'start' });
    });
}

function stopServerProcess() {
    return new Promise((resolve) => {
        if (!serverProcess) {
            updateStatus('stopped');
            return resolve();
        }

        // Listen for the stopped message
        const onStopped = (msg) => {
            if (msg.type === 'stopped') {
                serverProcess.removeListener('message', onStopped);
                clearTimeout(killTimeout);
                resolve();
            }
        };

        serverProcess.on('message', onStopped);

        // Safety timeout to kill process if it hangs
        const killTimeout = setTimeout(() => {
            serverProcess.removeListener('message', onStopped);
            if (serverProcess) {
                console.log('Force killing server process...');
                serverProcess.kill();
                serverProcess = null;
                updateStatus('stopped');
            }
            resolve();
        }, 5000);

        // Send stop command
        serverProcess.send({ command: 'stop' });
    });
}

// --- IPC Handlers for Renderer ---

ipcMain.handle('start-server', async () => {
    if (serverStatus === 'running' || serverStatus === 'starting') return { success: false, message: 'Server already running' };

    updateStatus('starting');
    try {
        const config = await startServerProcess();
        return { success: true, config };
    } catch (error) {
        updateStatus('stopped');
        return { success: false, error: error.message };
    }
});

ipcMain.handle('stop-server', async () => {
    if (serverStatus === 'stopped') return { success: false, message: 'Server not running' };

    updateStatus('stopping');
    try {
        await stopServerProcess();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-status', () => {
    return {
        status: serverStatus,
        config: currentConfig
    };
});

ipcMain.handle('open-url', async (event, url) => {
    await shell.openExternal(url);
    return { success: true };
});

ipcMain.handle('generate-qr', async (event, text) => {
    try {
        const QRCode = require('qrcode');
        const dataUrl = await QRCode.toDataURL(text, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
        return { success: true, dataUrl };
    } catch (error) {
        console.error('Error generating QR code:', error);
        return { success: false, error: error.message };
    }
});

// --- App Lifecycle ---

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', async (event) => {
    if (serverProcess) {
        event.preventDefault(); // Hold quit
        if (serverStatus !== 'stopping') {
            serverProcess.send({ command: 'stop' });
        }

        // Give it a moment to cleanup
        setTimeout(() => {
            if (serverProcess) serverProcess.kill();
            app.exit();
        }, 2000);
    }
});
