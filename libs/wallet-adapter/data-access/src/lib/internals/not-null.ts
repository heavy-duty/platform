import { filter, Observable } from 'rxjs';

export const isNotNull = <T>(source: Observable<T | null>): Observable<T> =>
  source.pipe(filter((item: T | null): item is T => item !== null));
