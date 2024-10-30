const { program } = require('commander');
const http = require('http');
const fs = require('fs');

program
  .requiredOption('-h, --host <host>', 'address of the server')
  .requiredOption('-p, --port <port>', 'port of the server')
  .requiredOption('-c, --cache <path>', 'path for directory with cache files')
  .parse(process.argv);

const { host, port, cache } = program.opts();

const requestListener = function (req, res) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\n');
}

const server = http.createServer(requestListener);

server.listen(parseInt(port), host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});

