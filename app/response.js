const createResponse = (socket) => {
    const response = {
        code: '404 Not Found',
        status(code) {
            this['code'] = code;
            return this;
        },
        send(data, headers){
            if(this.code === '404 Not Found'){
                socket.write(`HTTP/1.1 404 Not Found\r\n\r\n`);
                socket.end();
            }else if(!data){
                socket.write(`HTTP/1.1 ${this.code}\r\n\r\n`);
                socket.end();
            }else{
                socket.write(`HTTP/1.1 ${this['code']}\r\nContent-Type: ${headers['contentType']}\r\nContent-Length: ${data.length}\r\n\r\n${data}\r\n\r\n`);
                socket.end();
            } 
        }
    };
    return response;
}

module.exports = {
    createResponse
}