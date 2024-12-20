const { program } = require('commander');
const http = require('http');
const fs = require('fs').promises;
const superagent = require('superagent');

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
      const data = await fs.readFile(filePath);
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(data);
    } catch (err) {
      try {
        const response = await superagent.get(`https://http.cat/${code}`);
        
        await fs.writeFile(filePath, response.body);
        
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(response.body);
      } catch (fetchErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('\nNot Found');
      }
    }
  } else if (req.method === 'PUT') {
    let imageData = [];

    req.on('data', chunk => {
      imageData.push(chunk);
    });

    req.on('end', async () => {
      try {
        await fs.writeFile(filePath, Buffer.concat(imageData));
        res.writeHead(201, { 'Content-Type': 'text/plain' });
        res.end('\nCreated');
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('\nInternal Server Error');
      }
    });
  } else if (req.method === 'DELETE') {
    try {
      await fs.unlink(filePath);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('\nOK');
    } catch (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('\nNot Found');
    }
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('\nMethod Not Allowed');
  }
}

const server = http.createServer(requestListener);

server.listen(parseInt(port), host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});