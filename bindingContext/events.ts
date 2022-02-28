export enum LogEvents {
  START = 'start',
  VERIFIED = 'verified',
  UPDATED = 'updated',
  RENDERED = 'rendered'
}

export interface LogEventTimeObject {
  imageIndex?: number;
  imageHashlink?: string;
  imageUrl?: string;
  event?: LogEvents;
  timeFromStart?: string;
}
