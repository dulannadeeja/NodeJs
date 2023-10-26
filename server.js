const http = require('http');

const server = http.createServer((req, res) => {

    if (req.url === '/') {
        res.setHeader('Content-Type', 'text/html');
        res.write('<form action="/message" method="POST">');
        res.write('<input type="text" name="message">');
        res.write('<button type="submit">Send</button>');
        res.write('</form>');
        res.end();
    }

    if (req.url === '/message' && req.method === 'POST') {
        res.write('<h1>Message received</h1>');
        res.end();
    }
})

server.listen(3000);