const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');


const PORT = 5050;

const server = http.createServer((req, res) => {
  // Serve CSS
  if (req.url.startsWith('/public/')) {
    const filePath = path.join(__dirname, req.url);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('CSS file not found');
      }
      res.writeHead(200, { 'Content-Type': 'text/css' });
      return res.end(data);
    });
    return;
  }

  // Serve Guestbook Page
  if (req.url === '/' && req.method === 'GET') {
    fs.readFile('messages.txt', 'utf8', (err, messages) => {
      if (err) messages = 'No messages yet.';
      fs.readFile('guestbook.html', (err, html) => {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        const page = html.toString().replace('{{messages}}', messages.replace(/\n/g, '<br>'));
        res.end(page);
      });
    });
  }

  // Handle form submission
  else if (req.url === '/submit' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk.toString()));
    req.on('end', () => {
      const formData = querystring.parse(body);
      const entry = `${formData.name}: ${formData.message}\n`;
      fs.appendFile('messages.txt', entry, err => {
        if (err) console.error(err);
        res.writeHead(302, { Location: '/' }); // redirect to homepage
        res.end();
      });
    });
  }
//clear all messages
else if(req.url === '/clear' && req.method === 'POST'){
  fs.writeFile('messages.txt', '' , (err) => {
    if(err){
      console.error(err);
      res.writeHead(500, {'Content-Type' : 'text/plain'});
      return res.end('Error clearing messages');
    }
    res.writeHead(302,{Location: '/'});
    res.end();
  });
}
//delete last message
else if(req.url === '/delete-last' && req.method === 'POST'){
  fs.readFile('messages.txt', 'utf8' ,(err, data) => {
if(err){
  res.writeHead(302, { Location: '/'});
  return res.end();
}
if(data.trim() === ''){
  //file is empty
  res.writeHead(302, {Location: '/'});
  return res.end();
}

// split by newline and remove last message
const messages = data.split('\n').filter(line => line.trim() !== '');
messages.pop(); // remove last message

//write remianing messages back to file
fs.writeFile('messages.txt' , messages.join('\n') + (messages.length > 0 ? '\n' : ''),
(err) => {
if(err){
  console.error(err);
  res.writeHead(500, { 'Content-Type' : 'text/plain'});
  return res.end('Error deleting last message');
}
res.writeHead(302, { Location: '/'});
res.end();
});

  });
}


  // 404
  else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h2>404 Not Found</h2>');
  }
});


server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
