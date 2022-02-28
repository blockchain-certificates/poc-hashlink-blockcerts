export enum LogEvents {
  START = 'start',
  VERIFIED = 'verified',
  UPDATED = 'updated',
  RENDERED = 'rendered'
}

export interface LogEventTimeObject {
  imageIndex?: number;
  imageHashlink?: string;
  event?: LogEvents;
  timeFromStart?: string;
}
