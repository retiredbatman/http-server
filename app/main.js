const fs = require('fs');
const path = require('path');
const httpServer = require('./httpServer');

let INPUT_DIRECTORY = '';

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");


process.argv.forEach(function (val, index) {
    if (val === "--directory") {
      if (process.argv.length > index + 1) {
        INPUT_DIRECTORY = process.argv[index + 1];
      }
    }
});


const server = httpServer();

server.get('/', (req, res)=> {
    res.status('200 OK').send();
});

server.get('/echo/:id', (req, res)=> {
    const {params} =req;
    res.status('200 OK').send(params.id, {
        contentType: 'text/plain'
    });
});

server.get('/user-agent', (req, res)=> {
    const {headers} =req;
    res.status('200 OK').send(headers.userAgent, {
        contentType: 'text/plain'
    });
});

server.get('/files/:fileName', (req, res)=> {
    const {params} =req;
    const {fileName} = params;
    const directory = INPUT_DIRECTORY;
    const filePath = path.join(directory, fileName);
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if(err){
            res.status('404 Not Found').send();
        }else{
            fs.readFile(filePath, (err, data)=> {
                res.status('200 OK').send(data, {
                    contentType: 'application/octet-stream'
                });
            });  
        }
    });
});

server.post('/files/:fileName', (req, res)=> {
    const {params} =req;
        const {fileName} = params;
        const directory = INPUT_DIRECTORY;
        const filePath = path.join(directory, fileName);
        console.log(directory, fileName);
        fs.writeFile(filePath, req.body, (err)=> {
            if(!err){
                res.status('201 OK').send(); 
            }else{
                res.status('404 Not Found').send();
            }
        });
});


server.listen(4221,()=> console.log('server started'));




