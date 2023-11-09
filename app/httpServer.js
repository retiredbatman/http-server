const net = require("net");
const  {createRequest} = require("./request");
const { createResponse} =require("./response");

module.exports = () => {
    const server = net.createServer((socket) => {
        socket.on('data', data=> {
            const req = createRequest(data);
            const res = createResponse(socket);
            handleRequest(req, res);
        });
      socket.on("close", () => {
        socket.end();
        //server.close();
      });
    });

    const routes = {};

    const handleRequest = (req,res) => {
        const routeEntries = Object.entries(routes);
        for(let i = 0 ; i < routeEntries.length ; i++){
            const handler = getHandler(req);
            if(!!handler){
                handler(req,res);
                return;
            }
        }
        res.status('404 Not Found').send();
    }

    const getHandler = (req) => {
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
    
        // needed for complex matching and can be made generic
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


    const get = (path, handler) => {
        appendRoute(path, handler, 'GET');
    };
    const post = (path, handler) => {
        appendRoute(path, handler, 'POST');
    };

    const appendRoute = (path, handler, method) => {
        routes[path]= {
            ...routes[path],
            [method]: handler,
        }
    };

    const listen = (port, callback) => {
        server.listen(port, "localhost");
        callback();
    }; 



    return {
        listen,
        get,
        post
    };
}