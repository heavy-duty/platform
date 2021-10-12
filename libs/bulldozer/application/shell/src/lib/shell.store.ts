import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ApplicationStore,
  CollectionStore,
  InstructionStore,
} from '@heavy-duty/bulldozer/application/data-access';
import {
  generateApplicationMetadata,
  generateApplicationZip,
} from '@heavy-duty/bulldozer/application/utils/services/code-generator';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, of } from 'rxjs';
import { concatMap, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

interface ViewModel {
  notificationOpen: boolean;
}

const initialState: ViewModel = {
  notificationOpen: false,
};

@Injectable()
export class ApplicationShellStore extends ComponentStore<ViewModel> {
  readonly applicationMetadata$ = this.select(
    this._applicationStore.application$,
    this._collectionStore.collections$,
    this._instructionStore.instructions$,
    (application, collections, instructions) =>
      application &&
      generateApplicationMetadata(application, collections, instructions),
    { debounce: true }
  );

  constructor(
    private readonly _matSnackBar: MatSnackBar,
    private readonly _applicationStore: ApplicationStore,
    private readonly _collectionStore: CollectionStore,
    private readonly _instructionStore: InstructionStore
  ) {
    super(initialState);
  }

  notifyErrors = this.effect((error$: Observable<unknown>) =>
    error$.pipe(
      tap(() => this.patchState({ notificationOpen: true })),
      switchMap((error) =>
        this._matSnackBar
          .open(
            error instanceof Error ? error.name : (error as string),
            'Close',
            {
              panelClass: `error-snackbar`,
            }
          )
          .afterDismissed()
          .pipe(tap(() => this.patchState({ notificationOpen: false })))
      )
    )
  );

  downloadCode = this.effect((action$) =>
    action$.pipe(
      concatMap(() =>
        of(null).pipe(
          withLatestFrom(
            this._applicationStore.application$,
            this._collectionStore.collections$,
            this._instructionStore.instructions$
          ),
          map(
            ([, application, collections, instructions]) =>
              application &&
              generateApplicationMetadata(
                application,
                collections,
                instructions
              )
          )
        )
      ),
      isNotNullOrUndefined,
      tap((applicationMetadata) => generateApplicationZip(applicationMetadata))
    )
  );
}
