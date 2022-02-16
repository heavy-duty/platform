import { Pipe, PipeTransform } from '@angular/core';
import { interval, map, Observable, of, switchMap, takeWhile } from 'rxjs';

@Pipe({
  name: 'hdRelativeTime',
})
export class HdRelativeTimePipe implements PipeTransform {
  transform(date: number | null): Observable<string | null> {
    return of(date).pipe(
      switchMap((value) => {
        if (value === null) {
          return of(null);
        }

        return interval(1_000).pipe(
          takeWhile(() => value > Date.now()),
          map(() => {
            const seconds = Math.floor((value - Date.now()) / 1000);

            if (seconds < 1) {
              return null;
            } else if (seconds < 60) {
              return `${seconds.toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false,
              })}s`;
            } else {
              const minutes = Math.floor(seconds / 60);
              return `${minutes.toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false,
              })}:${(seconds - minutes * 60).toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false,
              })}`;
            }
          })
        );
      })
    );
  }
}
