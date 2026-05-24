const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const VALID_SOUNDS = new Set(['airhorn', 'buzzer', 'whoosh', 'laugh', 'ding', 'rickroll']);
const events = [];

function sendJson(res, status, data) {
    const body = JSON.stringify(data);
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Cache-Control': 'no-store'
    });
    res.end(body);
}

function readJson(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
            if (body.length > 1024) {
                reject(new Error('Request body too large'));
                req.destroy();
            }
        });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', reject);
    });
}

function serveIndex(res) {
    const filePath = path.join(PUBLIC_DIR, 'index.html');
    fs.readFile(filePath, (error, content) => {
        if (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Could not load index.html');
            return;
        }
        res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store'
        });
        res.end(content);
    });
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
        serveIndex(res);
        return;
    }

    if (req.method === 'GET' && url.pathname === '/events') {
        const since = Number(url.searchParams.get('since') || 0);
        sendJson(res, 200, {
            events: events.filter((event) => event.id > since)
        });
        return;
    }

    if (req.method === 'POST' && url.pathname === '/sound') {
        try {
            const body = await readJson(req);
            if (!VALID_SOUNDS.has(body.sound)) {
                sendJson(res, 400, { error: 'Invalid sound' });
                return;
            }
            const event = {
                id: Date.now(),
                sound: body.sound
            };
            events.push(event);
            events.splice(0, Math.max(0, events.length - 50));
            sendJson(res, 200, { ok: true, event });
        } catch (error) {
            sendJson(res, 400, { error: 'Invalid request' });
        }
        return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
});

server.listen(PORT, () => {
    console.log(`Sound panel running at http://localhost:${PORT}`);
    console.log(`Host panel: http://localhost:${PORT}/#host`);
});
