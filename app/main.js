const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const parseHttpData = (data) => {
    const dataTransformed = data.toString().split('\r\n');
    const req = {};
    const [firstLine, secondLine, thirdLine] = dataTransformed;
    const sections = firstLine.split(' ');
    req.method = sections[0];
    req.path = sections[1];
    req.httpVersion = sections[2];
    const headers = {};
    headers.host = secondLine.split(' ')[1];
    headers.userAgent = thirdLine.split(' ')[1];
    req.headers = headers;
    return req;
}

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    socket.on('data', data=> {
        const req = parseHttpData(data);
        const responseCode = req.path === '/' ? '200 OK' : '404 Not Found';
        socket.write(`HTTP/1.1 ${responseCode}\r\n\r\n`);
        socket.end();
    });
  socket.on("close", () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, "localhost");
