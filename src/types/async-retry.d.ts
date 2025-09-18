declare module "async-retry" {
  export interface Options {
    retries?: number;
    factor?: number;
    minTimeout?: number;
    maxTimeout?: number;
    randomize?: boolean;
    onRetry?: (err: Error, attempt: number) => void;
  }
  export type Bail = (err?: Error) => void;

  export default function retry<T>(
    fn: (bail: Bail, attempt: number) => Promise<T>,
    opts?: Options
  ): Promise<T>;
}
