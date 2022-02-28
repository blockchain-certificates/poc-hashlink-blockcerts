import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import {loggingPath, port} from "../bindingContext/endpoint";

const server = express();
server.use(bodyParser.json({limit: '1mb'}));
server.use(cors());

server.post(loggingPath, async (req, res) => {
  console.log(req.body);
  res.send('ok');
});

server.listen(port, () => {
  console.log(`Server listening at ${port}`);
});
