import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import {loggingPath, port} from "../bindingContext/endpoint";
import {LogEventTimeObject} from "../bindingContext/events";
import logToFile from "./logToFile";

const server = express();
server.use(bodyParser.json({limit: '1mb'}));
server.use(cors());

server.post<LogEventTimeObject>(loggingPath, async (req, res) => {
  console.log(req.body);
  try {
    await logToFile(req.body);
  } catch (e) {
    res.send({
      status: 500,
      message: e
    })
    throw new Error(e);
  }
  res.send('ok');
});

server.listen(port, () => {
  console.log(`Server listening at ${port}`);
});
