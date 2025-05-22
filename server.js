const http = require('http');
const fs = require('fs');
const path = require('path');

// No external dependencies - pure Node.js
const distFolder = path.join(__dirname, 'dist', 'aula-inteligente-frontend');

const server = http.createServer((req, res) => {
  // Get the requested path
  let filePath = path.join(distFolder, req.url === '/' ? 'index.html' : req.url);
  
  // Check if path is a directory
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  
  // Get the file extension
  const ext = path.extname(filePath);
  
  // Define content type based on extension
  const contentType = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
  }[ext] || 'text/plain';
  
  // Check if file exists
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      // For SPA, serve index.html for routes not found
      filePath = path.join(distFolder, 'index.html');
      return fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end('Internal server error');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content, 'utf-8');
      });
    }
    
    // Serve the file
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Internal server error');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});