import fs from 'fs';
import {LogEventTimeObject} from "../bindingContext/events";

export default async function logToFile (data: LogEventTimeObject) {
  const writeData = '\n' + Object.values(data).join(',');
  console.log('log to file', writeData);
  await fs.writeFile(`${__dirname}/logs/times.csv`, writeData,{ flag: 'a' }, (error) => {
    console.error(error);
  });
}
