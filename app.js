const { exec } = require('child_process');
const { port, shutdown_command } = require('./config.json');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
    ws.on('message', (message) => {
        message = message.toString();
        
        console.log('Received:', message);
        if (message === 'shutdown') {
            ws.send('Shutdown command received');
            exec(shutdown_command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    ws.send('Shutdown command failed.');
                } else {
                    ws.send('Shutdown command executed.');
                }
            });
        }
    });

});

server.listen(port, () => {
    console.log(`RemoteControl Client is listening on port ${port}...`);
});