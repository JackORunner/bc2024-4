const { program } = require('commander');
const http = require('http');
const fs = require('fs');

program
  .requiredOption('-h, --host <host>', 'address of the server')
  .requiredOption('-p, --port <port>', 'port of the server')
  .requiredOption('-c, --cache <path>', 'path for directory with cache files')
  .parse(process.argv);

const { host, port, cache } = program.opts();

async function requestListener(req, res) {
  const urlParts = req.url.split('/');
  const code = urlParts[1];
  const filePath = `${cache}/${code}.jpg`;

  if (req.method === 'GET') {
    try {
      const data = await fs.readFile(filePath); // асинхронне читання файлу
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(data);
    } catch (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  } 
}

const server = http.createServer(requestListener);

server.listen(parseInt(port), host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});

