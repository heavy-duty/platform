import {
  concatMap,
  defer,
  EMPTY,
  iif,
  Observable,
  repeatWhen,
  timer,
} from 'rxjs';

export function exponentialBackoffDelay(iteration: number, delay: number) {
  return Math.pow(2, iteration) * delay;
}

export interface RepeatWithBackoffConfig {
  delay: number;
  attempts?: number;
  delayMax?: number;
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
              return iif(
                () => attempt < attempts,
                timer(
                  Math.min(exponentialBackoffDelay(attempt, delay), delayMax)
                ),
                EMPTY
              );
            })
          )
        )
      );
    });
}
