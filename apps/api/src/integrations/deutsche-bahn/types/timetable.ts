import { Event, HistoricDelay, HistoricPlatformChange } from "./event";
import { Message, TripLabel } from "./message";
import { ReferenceTripRelationToStop } from "./common";

export interface Connection {
  cs: import("./common").ConnectionStatus;

  eva?: number;

  id: string;

  ref?: Pick<TimetableStop, "id" | "eva">;

  s: Pick<TimetableStop, "id" | "eva">;

  ts: string;
}

export interface ReferenceTripStopLabel {
  eva: number;

  i: number;

  n: string;

  pt: string;
}

export interface ReferenceTripLabel {
  c: string;

  n: string;
}

export interface ReferenceTrip {
  c: boolean;

  ea: ReferenceTripStopLabel;

  id: string;

  rtl: ReferenceTripLabel;

  sd: ReferenceTripStopLabel;
}

export interface ReferenceTripRelation {
  rt: ReferenceTrip;

  rts: ReferenceTripRelationToStop;
}

export interface TripReference {
  rt?: TripLabel[];

  tl: TripLabel;
}

export interface TimetableStop {
  ar?: Event;

  conn?: Connection[];

  dp?: Event;

  eva: number;

  hd?: HistoricDelay[];

  hpc?: HistoricPlatformChange[];

  id: string;

  m?: Message[];

  ref?: TripReference;

  rtr?: ReferenceTripRelation[];

  tl?: TripLabel;
}

export interface Timetable {
  eva?: number;

  m?: Message[];

  s?: TimetableStop[];

  station?: string;
}
