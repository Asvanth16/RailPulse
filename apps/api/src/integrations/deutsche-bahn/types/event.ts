import { DelaySource, EventStatus } from "./common";
import { Message } from "./message";

export interface HistoricDelay {
  /**
   * Arrival delay
   */
  ar?: string;

  /**
   * Detailed delay cause
   */
  cod?: string;

  /**
   * Departure delay
   */
  dp?: string;

  /**
   * Delay source
   */
  src?: DelaySource;

  /**
   * Timestamp
   */
  ts?: string;
}

export interface HistoricPlatformChange {
  /**
   * Arrival platform
   */
  ar?: string;

  /**
   * Cause of platform change
   */
  cot?: string;

  /**
   * Departure platform
   */
  dp?: string;

  /**
   * Timestamp
   */
  ts?: string;
}

export interface Event {
  /**
   * Changed destination
   */
  cde?: string;

  /**
   * Cancellation timestamp
   */
  clt?: string;

  /**
   * Changed platform
   */
  cp?: string;

  /**
   * Changed path
   */
  cpth?: string;

  /**
   * Changed status
   */
  cs?: EventStatus;

  /**
   * Changed time
   */
  ct?: string;

  /**
   * Distant change
   */
  dc?: number;

  /**
   * Hidden flag
   */
  hi?: number;

  /**
   * Line number
   */
  l?: string;

  /**
   * Messages
   */
  m?: Message[];

  /**
   * Planned destination
   */
  pde?: string;

  /**
   * Planned platform
   */
  pp?: string;

  /**
   * Planned path
   */
  ppth?: string;

  /**
   * Planned status
   */
  ps?: EventStatus;

  /**
   * Planned time
   */
  pt?: string;

  /**
   * Transition trip ID
   */
  tra?: string;

  /**
   * Wing train IDs
   */
  wings?: string;
}