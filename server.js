const http = require('http');
const fs = require('fs');
const path = require('path');

// Define server root path
const serverRoot = __dirname;
console.log('Server root directory:', serverRoot);

// Angular now outputs to a 'browser' subfolder with the new application builder
let baseDistFolder = path.join(serverRoot, 'dist', 'aula-inteligente-frontend');
let distFolder = path.join(baseDistFolder, 'browser'); // Check the browser subfolder first

// If browser subfolder doesn't exist, fall back to the base folder
if (!fs.existsSync(distFolder)) {
  distFolder = baseDistFolder;
}

// Log dist folder status
if (fs.existsSync(distFolder)) {
  console.log('Found Angular dist folder:', distFolder);
  const files = fs.readdirSync(distFolder);
  console.log('Files in dist folder:', files.join(', '));
} else {
  console.error('ERROR: Angular dist folder not found!');
}

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Handle requests
  try {
    // Remove query parameters
    let reqPath = req.url.split('?')[0];
    
    // Default to index.html for root path
    if (reqPath === '/') {
      reqPath = '/index.html';
    }
    
    // Determine file path
    const filePath = path.join(distFolder, reqPath);
    
    // Determine content type
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.eot': 'font/eot'
    };
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
      console.log(`200 ${filePath}`);
    } else {
      // If file doesn't exist, try serving index.html (for SPA routing)
      const indexPath = path.join(distFolder, 'index.html');
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content, 'utf-8');
        console.log(`200 ${indexPath} (fallback for ${filePath})`);
      } else {
        console.error(`404 Not Found: ${filePath} and no index.html fallback`);
        res.writeHead(404);
        res.end('Not Found');
      }
    }
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end('Internal Server Error: ' + error.message);
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});