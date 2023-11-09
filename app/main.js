const net = require("net");
const fs = require('fs');
const path = require('path');

let INPUT_DIRECTORY = '';

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
    const body = dataTransformed[7];
    req.body = body;
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
    if(req.path.startsWith('/files/')){
        req.params.fileName= req.path.split('/files/')[1];
        return routes['/files/:fileName'][req.method];
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
            socket.end();
        },
    },
    '/echo/:id': {
        'GET': (req,socket) => {
            const {params} =req;
            const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${params.id.length}\r\n\r\n${params.id}\r\n\r\n`
            socket.write(response);
            socket.end();
        }
    },
    '/user-agent': {
        'GET': (req,socket) => {
            const {headers} =req;
            const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${headers.userAgent.length}\r\n\r\n${headers.userAgent}\r\n\r\n`
            socket.write(response);
            socket.end();
        }
    },
    '/files/:fileName': {
        'GET': (req,socket) => {
            const {params} =req;
            const {fileName} = params;
            const directory = INPUT_DIRECTORY;
            const filePath = path.join(directory, fileName);
            fs.access(filePath, fs.constants.F_OK, (err) => {
                if(err){
                    handle404(req, socket);
                }else{
                    fs.readFile(filePath, (err, data)=> {
                        const response = `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${data.length}\r\n\r\n${data}\r\n\r\n`
                        socket.write(response);
                        socket.end();
                    });  
                }
            });         
        },
        'POST': (req,socket) => {
            const {params} =req;
            const {fileName} = params;
            const directory = INPUT_DIRECTORY;
            const filePath = path.join(directory, fileName);
            console.log(directory, fileName);
            fs.writeFile(filePath, req.body, (err)=> {
                if(!err){
                    socket.write(`HTTP/1.1 201 OK\r\n\r\n`);
                    socket.end();   
                }else{
                    handle404();
                }
            });
        }
    },
};

const handle404 = (req, socket) => {
    socket.write(`HTTP/1.1 404 Not Found\r\n\r\n`);
    socket.end();
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
    });
  socket.on("close", () => {
    socket.end();
    //server.close();
  });
});



server.listen(4221, "localhost");

process.argv.forEach(function (val, index, array) {
    console.log(val);
    if (val === "--directory") {
      if (process.argv.length > index + 1) {
        INPUT_DIRECTORY = process.argv[index + 1];
        console.log("Received input directory:", INPUT_DIRECTORY);
      }
    }
  1
  });


//  /Users/sroy/Documents/Github
