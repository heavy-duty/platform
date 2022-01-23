import { Injectable } from '@angular/core';
import { WorkspaceStore } from '@heavy-duty/bulldozer/application/data-access';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';

@Injectable()
export class WorkspaceExplorerStore extends ComponentStore<object> {
  readonly connected$ = this._walletStore.connected$;
  readonly workspaceId$ = this._workspaceStore.workspaceId$;

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _workspaceStore: WorkspaceStore
  ) {
    super({});
  }
}
