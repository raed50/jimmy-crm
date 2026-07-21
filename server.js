const http = require('http');
const fs = require('fs');
const path = require('path');

// Load .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...val] = trimmed.split('=');
      if (key && val.length) process.env[key.trim()] = val.join('=').trim();
    }
  });
}

const PORT = 3001;
const PUBLIC = path.join(__dirname, 'public');
const API_DIR = path.join(__dirname, 'api');

// Simulate Vercel serverless locally
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  console.log(`${req.method} ${req.url}`);

  // API routes
  if (req.url.startsWith('/api/')) {
    const apiName = req.url.split('/')[2].split('?')[0];
    const apiFile = path.join(API_DIR, apiName + '.js');

    if (!fs.existsSync(apiFile)) {
      res.writeHead(404);
      return res.end('API not found');
    }

    try {
      // Parse body for POST
      let body = {};
      if (req.method === 'POST') {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString();
        body = raw ? JSON.parse(raw) : {};
      }

      // Parse query
      const urlObj = new URL(req.url, `http://localhost:${PORT}`);
      const query = Object.fromEntries(urlObj.searchParams);

      const mockReq = { method: req.method, headers: req.headers, body, query };
      const mockRes = {
        setHeader: (k, v) => res.setHeader(k, v),
        status: (code) => ({ json: (data) => { res.writeHead(code, {'Content-Type':'application/json'}); res.end(JSON.stringify(data)); } })
      };

      // Execute the API handler
      const handler = require(apiFile);
      if (typeof handler === 'function') await handler(mockReq, mockRes);
    } catch (err) {
      console.error('API error:', err.message);
      res.writeHead(500, {'Content-Type':'application/json'});
      res.end(JSON.stringify({error: err.message}));
    }
    return;
  }

  // Static files
  let filePath = path.join(PUBLIC, req.url === '/' ? 'index.html' : req.url);
  if (!fs.existsSync(filePath)) filePath = path.join(PUBLIC, 'index.html');

  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'text/html';
  const content = fs.readFileSync(filePath);
  res.writeHead(200, {'Content-Type': contentType});
  res.end(content);
});

server.listen(PORT, () => {
  console.log(`\n🚀 Jimmy's Fitness CRM running at http://localhost:${PORT}\n`);
  console.log(`   Login: admin / jimmy2024\n`);
});
