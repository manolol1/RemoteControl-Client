const { exec, spawn } = require('child_process');
const { port, shutdown_command, reboot_command, scripts_enabled } = require('./config.json');
const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);

// runs shutdown command specified in config.json
app.get('/shutdown', (req, res) => {
    console.log("Received Command: shutdown")
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

// runs reboot command specified in config.json
app.get('/reboot', (req, res) => {
    console.log("Received Command: reboot")
    res.status(200).send('Client is rebooting...');
    exec(reboot_command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            res.status(500).send('An error occured while rebooting the client computer.');
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
});

app.get('/ping', (req, res) => {
    console.log("Received Command: ping")
    res.status(200).send('Client is online.');
});

// finds all .sh files in the scripts directory and returns their names as JSON
app.get('/scripts', (req, res) => {
    console.log("Received Command: scripts")
    // read all files in the scripts directory
    if (scripts_enabled) {
        fs.readdir(path.join(__dirname, 'scripts'), (err, files) => {
            if (err) {
                console.error(err);
                res.status(500).send('An error occured while reading the scripts directory.');
                return;
            }
            const scripts = files.filter(file => path.extname(file) === '.sh'); // only return shell scripts
            res.status(200).json(scripts);
        });
    } else {
        res.status(403).send('Scripts are disabled.');
    }
});

// executes the specified script and sends output through SSE Event Stream
app.get('/scripts/:script', (req, res) => {
    if (scripts_enabled) {
        const script = req.params.script;
        const scriptPath = path.join(__dirname, 'scripts', script);

        // keep connection alive for SSE
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
        });

        // check if script exists
        if (fs.existsSync(scriptPath)) {
            console.log("Executing script: " + scriptPath);

            res.write('event: start\n');
            res.write(`data: ${JSON.stringify({ message: 'Script started.' })}\n\n`);

            // execute script and stream output via SSE
            const child = spawn(scriptPath);

            // send messages from stdout
            child.stdout.on('data', data => {
                res.write('event: stdout\n');
                res.write(`data: ${JSON.stringify({ message: data.toString() })}\n\n`);
            });

            // send messages from stderr
            child.stderr.on('data', data => {
                res.write('event: stderr\n');
                res.write(`data: ${JSON.stringify({ message: data.toString() })}\n\n`);
            });

            // send messages when an error occurs while running the script (e.g. permission denied)
            child.on('error', err => {
                console.error(`Failed to start script: ${err}`);
                res.write('event: err\n');
                res.write(`data: ${JSON.stringify({ message: err.message, code: err.code })}\n\n`);
                res.end();
            });

            // send exit code when the script finishes
            child.on('exit', code => {
                res.write('event: exit\n');
                res.write(`data: ${JSON.stringify({ code })}\n\n`);
                res.end();
            });
        } else {
            // script doesn't exist
            res.write('event: err\n');
            res.write(`data: ${JSON.stringify({ message: 'Script not found.', code: 404 })}\n\n`);
            res.write('code: 404\n\n');
            res.end();
        }
    } else {
        // scripts are disabled in config.json
        console.log('Someone tried executing a script, but scripts are disabled.')
        res.write('event: err\n');
        res.write(`data: ${JSON.stringify({ message: 'Scripts disabled.', code: 403 })}\n\n`);
        res.write('code: 403\n\n');
    }
});

server.listen(port, () => {
    console.log(`RemoteControl Client is listening on port ${port}...`);
});