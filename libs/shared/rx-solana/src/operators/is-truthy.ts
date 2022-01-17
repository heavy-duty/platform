import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export const isTruthy = <T>(source: Observable<T>) =>
  source.pipe(filter((item) => !!item));
