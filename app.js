const { exec } = require('child_process');
const { port, shutdown_command, reboot_command } = require('./config.json');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

app.get('/shutdown', (req, res) => {
    exec(shutdown_command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            res.status(500).send('An error occured while shutting down the client computer.');
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        res.status(200).send('Client is shutting down...');
    });
});

app.get('/reboot', (req, res) => {
    exec(reboot_command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            res.status(500).send('An error occured while rebooting the client computer.');
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        res.status(200).send('Client is rebooting...');
    });
});

app.get('/ping', (req, res) => {
    res.status(200).send('Client is online.');
});

server.listen(port, () => {
    console.log(`RemoteControl Client is listening on port ${port}...`);
});