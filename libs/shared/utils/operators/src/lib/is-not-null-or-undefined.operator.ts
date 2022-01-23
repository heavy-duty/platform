import { filter, Observable } from 'rxjs';

export const isNotNullOrUndefined = <T>(
  source: Observable<T | null | undefined>
) =>
  source.pipe(filter((item): item is T => item !== null && item !== undefined));
