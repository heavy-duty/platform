import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';

interface ViewModel {
  online: boolean;
  error?: unknown;
}

@Injectable({ providedIn: 'root' })
export class InternetConnectivityStore extends ComponentStore<ViewModel> {
  readonly online$ = this.select(({ online }) => online);

  constructor() {
    super();

    try {
      this.setState({ online: window.navigator.onLine });
    } catch (error) {
      this.setState({ online: false, error });
    }
  }

  readonly setOnline = this.updater((state, online: boolean) => ({
    ...state,
    online,
  }));
}
