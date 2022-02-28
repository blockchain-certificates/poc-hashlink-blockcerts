import express from 'express';
import bodyParser from 'body-parser';

const server = express();
server.use(bodyParser.json({limit: '1mb'}));

server.post('/log', async (req, res) => {
  console.log(req.body);
});

const port = 3333;
server.listen(port, () => {
  console.log(`Server listening at ${port}`);
});
