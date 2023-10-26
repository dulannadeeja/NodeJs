
const routesHandler = (req, res) => {
    if (req.url === '/') {
        res.setHeader('Content-Type', 'text/html');
        res.write('<html>');
        res.write('<head><title>NodeJS</title></head>');
        res.write('<body><h1>Hello from NodeJS Server!</h1></body>');
        res.write('<form action="/create-user" method="POST"><input type="text" name="username"><button type="submit">Send</button></form>');
        res.write('</html>');
        return res.end();
    }

    if (req.url === '/users') {
        res.setHeader('Content-Type', 'text/html');
        res.write('<html>');
        res.write('<head><title>NodeJS</title></head>');
        res.write('<body><ul><li>dulannadeeja</li><li>kaushikehsla</li></ul></body>');
        res.write('</html>');
        return res.end();
    }

    if (req.url === '/create-user' && req.method === 'POST') {
        const body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        });

        req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString();
            const username = parsedBody.split("=")[1];
            console.log(username);
        });

        res.statusCode = 302;
        res.setHeader('Location', '/');
        return res.end();
    }

    res.setHeader('Content-Type', 'text/html');
    res.statusCode = 404;
    res.write('<html><head><title>page not found</title></head><body><h1>page not found!</h1></body></html>');
    res.end();
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

