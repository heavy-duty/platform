import { concatMap, defer, EMPTY, Observable, repeatWhen, timer } from 'rxjs';

export function exponentialBackoffDelay(iteration: number, delay: number) {
  return Math.pow(2, iteration) * delay;
}

export interface RepeatWithBackoffConfig {
  delay: number;
  attempts?: number;
  delayMax?: number;
  attemptCallback?: (attempt: Attempt) => unknown;
}

interface Attempt {
  createdAt: number;
  nextAttemptAt: number;
}

export function repeatWithBackoff(
  config: RepeatWithBackoffConfig
): <T>(source: Observable<T>) => Observable<T> {
  const { delay, attempts = Infinity, delayMax = Infinity } = config;

  return <T>(source: Observable<T>) =>
    defer(() => {
      let counter = 0;
      return source.pipe(
        repeatWhen<T>((notifier) =>
          notifier.pipe(
            concatMap(() => {
              const attempt = counter++;

              if (attempts <= attempt) {
                return EMPTY;
              }

              const exponentialDelay = Math.min(
                exponentialBackoffDelay(attempt, delay),
                delayMax
              );

              if (config.attemptCallback) {
                config.attemptCallback({
                  createdAt: Date.now(),
                  nextAttemptAt: Date.now() + exponentialDelay,
                });
              }

              return timer(exponentialDelay);
            })
          )
        )
      );
    });
}
