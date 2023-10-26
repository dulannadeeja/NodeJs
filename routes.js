const fs = require('fs');
const routesHandler = (req, res) => {
    if (req.url === '/') {
        res.setHeader('Content-Type', 'text/html');
        res.write('<form action="/message" method="POST">');
        res.write('<input type="text" name="message">');
        res.write('<button type="submit">Send</button>');
        res.write('</form>');
        return res.end();
    }

    if (req.url === '/message' && req.method === 'POST') {
        let body = [];

        req.on('data', (chunk) => {
            console.log(chunk);
            body.push(chunk);
        });

        req.on('end', () => {
            body = Buffer.concat(body).toString();
            console.log(body);
            const message = body.split('=')[1];
            fs.writeFileSync('message.txt', message);
            res.statusCode = 302;
            res.setHeader('Location', '/');
            return res.end();
        })
    }
}

module.exports = routesHandler;

// alternative way to export
// module.exports = {
//     handler: routesHandler,
// };

// alternative way to export
// module.exports.handler = routesHandler;

// alternative way to export
// exports.handler = routesHandler;
