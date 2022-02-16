import { fromEvent, Observable, Observer, Subscription } from 'rxjs';

export const online = () =>
  new Observable((observer: Observer<boolean>) => {
    try {
      observer.next(window.navigator.onLine);
    } catch (error) {
      observer.error(error);
    }

    const subscriptions = new Subscription();

    if (window === undefined) {
      observer.error(new Error('Window is undefined'));
    } else {
      const onlineSubscription = fromEvent(window, 'online').subscribe(() =>
        observer.next(true)
      );

      const offlineSubscription = fromEvent(window, 'offline').subscribe(() =>
        observer.next(false)
      );
      subscriptions.add(onlineSubscription);
      subscriptions.add(offlineSubscription);
    }

    return () => {
      subscriptions.unsubscribe();
    };
  });
