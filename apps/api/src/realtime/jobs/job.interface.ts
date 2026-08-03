export interface Job {
  readonly name: string;

  execute(): Promise<void>;
}