import {
  DistributorType,
  MessageType,
  Priority,
  TripType,
} from "./common";

export interface DistributorMessage {
  /**
   * Internal text
   */
  int?: string;

  /**
   * Distributor name
   */
  n?: string;

  /**
   * Distributor type
   */
  t?: DistributorType;

  /**
   * Timestamp (YYMMddHHmm)
   */
  ts?: string;
}

export interface TripLabel {
  /**
   * Train category (ICE, IC, RE...)
   */
  c: string;

  /**
   * Filter flags
   */
  f?: string;

  /**
   * Train number
   */
  n: string;

  /**
   * Railway operator
   */
  o: string;

  /**
   * Trip type
   */
  t?: TripType;
}

export interface Message {
  /**
   * Message code
   */
  c?: number;

  /**
   * Category
   */
  cat?: string;

  /**
   * Deleted flag
   */
  del?: number;

  /**
   * Distributor messages
   */
  dm?: DistributorMessage[];

  /**
   * External category
   */
  ec?: string;

  /**
   * External link
   */
  elnk?: string;

  /**
   * External text
   */
  ext?: string;

  /**
   * Valid from
   */
  from?: string;

  /**
   * Message ID
   */
  id: string;

  /**
   * Internal text
   */
  int?: string;

  /**
   * Owner
   */
  o?: string;

  /**
   * Priority
   */
  pr?: Priority;

  /**
   * Message type
   */
  t: MessageType;

  /**
   * Trip labels
   */
  tl?: TripLabel[];

  /**
   * Valid until
   */
  to?: string;

  /**
   * Timestamp
   */
  ts: string;
}