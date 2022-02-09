import { Observable, share, tap } from 'rxjs';

export const shareWhileSubscribed =
  (outOfSubscriptions: () => unknown) =>
  <T>(source: Observable<T>) => {
    let subscribers = 0;

    return source.pipe(
      share(),
      tap({
        subscribe: () => {
          subscribers += 1;
        },
        unsubscribe: () => {
          subscribers -= 1;
          if (subscribers === 0) {
            outOfSubscriptions();
          }
        },
      })
    );
  };
