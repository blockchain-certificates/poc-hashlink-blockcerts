import {LogEventTimeObject} from "../../../bindingContext/events";
import logToServer from "./logToServer";

function toSecond (value: number): string {
  return value / 1000 + 's';
}

let startTime: number;

export function registerStartTime () {
  startTime = Date.now();
  console.log('DOM loaded at', startTime);
}

export function logTimeNow (data: LogEventTimeObject) {
  const time = Date.now();
  const timeFromStart = toSecond(time - startTime);
  console.log(data.event, data.imageIndex, 'at', time, 'delta', timeFromStart);
  logToServer({
    ...data,
    timeFromStart
  });
}
