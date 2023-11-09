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

// matchPath /echo/:id
// path /echo/123 

const matcher = (matchPath, req, res) => {
    req.params = {};
    if(req.path.startsWith('/echo/')){
        req.params.id= req.path.split('/echo/')[1];
        return routes['/echo/:id'][req.method];
    }
    if(req.path.startsWith('/user-agent')){
        return routes['/user-agent'][req.method];
    }
    if(req.path === '/'){
        return routes['/'][req.method];
    }
    return null;

    // const regexStr = new RegExp(`${matchPath
    //     .split('/')
    //     .map(s => s.startsWith(':') ? '(\\w+)': s)
    //     .join('\/')
    // }$`) ;
    // const matches  = regexStr.exec(req.path);
    // if(!matches){
    //     return null;
    // }
    // req.params = {};
    // matchPath.split('/').forEach((s, index)=> {
    //     if(s.startsWith(':')){
    //         const key = s.split(':')[1];
    //         req.params[key] = matches[index-1];
    //     }
    // });
    // return routes[matchPath][req.method];
}

const routes = {
    '/': {
        'GET': (req,socket) => {
            socket.write(`HTTP/1.1 200 OK\r\n\r\n`);
        },
    },
    '/echo/:id': {
        'GET': (req,socket) => {
            const {params} =req;
            const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${params.id.length}\r\n\r\n${params.id}\r\n\r\n`
            socket.write(response);
        }
    },
    '/user-agent': {
        'GET': (req,socket) => {
            const {headers} =req;
            const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${headers.userAgent.length}\r\n\r\n${headers.userAgent}\r\n\r\n`
            socket.write(response);
        }
    },
};

const handle404 = (req, socket) => {
    socket.write(`HTTP/1.1 404 Not Found\r\n\r\n`);
}

const handleRequest = (req,socket) => {
    const routeEntries = Object.entries(routes);
    for(let i = 0 ; i < routeEntries.length ; i++){
        const handler = matcher(routeEntries[i][0], req);
        if(!!handler){
            handler(req,socket);
            return;
        }
    }
    handle404(req,socket);
}



// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    socket.on('data', data=> {
        const req = parseHttpData(data);
        handleRequest(req, socket);
        socket.end();
    });
  socket.on("close", () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, "localhost");
