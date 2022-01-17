import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export const isNotNullOrUndefined = <T>(
  source: Observable<T | null | undefined>
) =>
  source.pipe(filter((item): item is T => item !== null && item !== undefined));
