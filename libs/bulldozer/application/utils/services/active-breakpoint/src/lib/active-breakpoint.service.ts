import { BreakpointObserver } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ActiveBreakpointService {
  constructor(private breakpointObserver: BreakpointObserver) {}

  private readonly isSmall$ = this.breakpointObserver
    .observe('(min-width: 640px)')
    .pipe(map((result) => (result.matches ? 'sm' : null)));
  private readonly isMedium$ = this.breakpointObserver
    .observe('(min-width: 768px)')
    .pipe(map((result) => (result.matches ? 'md' : null)));
  private readonly isLarge$ = this.breakpointObserver
    .observe('(min-width: 1024px)')
    .pipe(map((result) => (result.matches ? 'lg' : null)));
  private readonly isXLarge$ = this.breakpointObserver
    .observe('(min-width: 1280px)')
    .pipe(map((result) => (result.matches ? 'xl' : null)));
  private readonly is2XLarge$ = this.breakpointObserver
    .observe('(min-width: 1536px)')
    .pipe(map((result) => (result.matches ? '2xl' : null)));
  readonly activeBreakpoint$ = combineLatest([
    this.isSmall$,
    this.isMedium$,
    this.isLarge$,
    this.isXLarge$,
    this.is2XLarge$,
  ]).pipe(
    map((results) =>
      results.reduce((match, result) => (result ? result : match), 'xs')
    ),
    shareReplay({
      bufferSize: 1,
      refCount: true,
    })
  );
}
