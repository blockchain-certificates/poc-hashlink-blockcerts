import fs from 'fs';
import {LogEventTimeObject} from "../bindingContext/events";

const filePath = `${__dirname}/logs/times.csv`;
const csvHeader = 'event,imageIndex,imageHashlink,timeFromStart';

async function writeData (data: LogEventTimeObject) {
  const writeData = '\n' + Object.values(data).join(',');
  console.log('log to file', writeData);
  await fs.writeFile(filePath, writeData,{ flag: 'a' }, (error) => {
    if (error) {
      console.error(error);
    }
  });
}

export default async function logToFile (data: LogEventTimeObject) {
  await fs.readFile(filePath, async function (error) {
    if (error) {
      console.log('file does not exist, creating');
      await fs.writeFile(filePath, csvHeader, null, function (error) {
        if (error) {
          console.error(error);
        }
        writeData(data);
      });
      return;
    }
    writeData(data);
  });
}
