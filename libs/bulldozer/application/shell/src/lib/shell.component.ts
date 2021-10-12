import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { WalletStore } from '@danmt/wallet-adapter-angular';
import {
  ApplicationStore,
  CollectionStore,
  InstructionStore,
} from '@heavy-duty/bulldozer/application/data-access';
import { isNotNullOrUndefined } from '@heavy-duty/shared/utils/operators';
import { merge } from 'rxjs';

import { ApplicationShellStore } from './shell.store';

@Component({
  selector: 'bd-application-shell',
  template: `
    <bd-navigation (downloadCode)="onDownloadCode()">
      <router-outlet></router-outlet>
    </bd-navigation>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ApplicationStore,
    CollectionStore,
    InstructionStore,
    ApplicationShellStore,
  ],
})
export class ApplicationShellComponent implements OnInit {
  constructor(
    private readonly _applicationShellStore: ApplicationShellStore,
    private readonly _applicationStore: ApplicationStore,
    private readonly _collectionStore: CollectionStore,
    private readonly _instructionStore: InstructionStore,
    private readonly _walletStore: WalletStore
  ) {}

  ngOnInit() {
    this._applicationShellStore.notifyErrors(
      merge(
        this._applicationStore.error$,
        this._collectionStore.error$,
        this._instructionStore.error$,
        this._walletStore.error$
      ).pipe(isNotNullOrUndefined)
    );
  }

  onDownloadCode() {
    this._applicationShellStore.downloadCode();
  }
}
