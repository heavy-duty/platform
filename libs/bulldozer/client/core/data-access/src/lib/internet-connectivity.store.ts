import { online } from '@heavy-duty/rxjs';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { distinctUntilChanged } from 'rxjs';

interface ViewModel {
  online: boolean;
  error: unknown;
}

const initialState: ViewModel = {
  online: false,
  error: null,
};

export class InternetConnectivityStore extends ComponentStore<ViewModel> {
  readonly online$ = this.select(({ online }) => online);

  constructor() {
    super(initialState);
  }

  readonly loadOnline = this.effect(() =>
    online().pipe(
      distinctUntilChanged(),
      tapResponse(
        (online) => this.patchState({ online }),
        (error) => this.patchState({ error })
      )
    )
  );
}
