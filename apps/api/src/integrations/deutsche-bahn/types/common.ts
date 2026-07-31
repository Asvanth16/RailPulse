export enum ConnectionStatus {
  WAITING = "w",
  TRANSITION = "n",
  ALTERNATIVE = "a",
}

export enum DelaySource {
  LEIBIT = "L",
  RISNE_AUT = "NA",
  RISNE_MAN = "NM",
  VDV = "V",
  ISTP_AUT = "IA",
  ISTP_MAN = "IM",
  AUTOMATIC_PROGNOSIS = "A",
}

export enum DistributorType {
  CITY = "s",
  REGION = "r",
  LONG_DISTANCE = "f",
  OTHER = "x",
}

export enum EventStatus {
  PLANNED = "p",
  ADDED = "a",
  CANCELLED = "c",
}

export enum MessageType {
  HIM = "h",
  QUALITY_CHANGE = "q",
  FREE = "f",
  CAUSE_OF_DELAY = "d",
  IBIS = "i",
  UNASSIGNED_IBIS = "u",
  DISRUPTION = "r",
  CONNECTION = "c",
}

export enum Priority {
  HIGH = "1",
  MEDIUM = "2",
  LOW = "3",
  DONE = "4",
}

export enum ReferenceTripRelationToStop {
  BEFORE = "b",
  END = "e",
  BETWEEN = "c",
  START = "s",
  AFTER = "a",
}

export enum TripType {
  PASSENGER = "p",
  EXTRA = "e",
  SPECIAL = "z",
  SHUNTING = "s",
  HISTORICAL = "h",
  NOT_SPECIFIED = "n",
}