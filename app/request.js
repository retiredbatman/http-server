const createRequest = (buffer) => {
    const request = {};

    const dataTransformed = buffer.toString().split('\r\n');
    const [firstLine, secondLine, thirdLine] = dataTransformed;
    const sections = firstLine.split(' ');
    request.method = sections[0];
    request.path = sections[1];
    request.httpVersion = sections[2];

    const headers = {};
    headers.host = secondLine.split(' ')[1];
    headers.userAgent = thirdLine.split(' ')[1];
    request.headers = headers;

    const [_, body] = buffer.toString().split('\r\n\r\n')
    request.body = body;

    return request;
}

module.exports= {
    createRequest
}