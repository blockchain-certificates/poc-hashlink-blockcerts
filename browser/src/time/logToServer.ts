import { LogEventTimeObject } from '../../../bindingContext/events';
import {setHeaders} from "../../../utils/headers";
import {loggingPath, port} from "../../../bindingContext/endpoint";

const loggingServer = `http://localhost:${port}`;
const loggingEndpoint = `${loggingServer}${loggingPath}`

export default async function logToServer (data: LogEventTimeObject) {
  console.log('logging to server', data.event, data.imageIndex);
  await fetch(loggingEndpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: setHeaders()
  });
}
