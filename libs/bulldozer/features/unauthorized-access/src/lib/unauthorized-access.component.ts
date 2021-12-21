import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'bd-unauthorized-access',
  template: `
    <p>Connect your wallet to start building</p>
    <hd-wallet-multi-button
      class="ml-auto bd-custom-color"
      color="primary"
    ></hd-wallet-multi-button>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnauthorizedAccessComponent implements OnInit {
  @HostBinding('class') class = 'block';

  constructor(
    private readonly _walletStore: WalletStore,
    private readonly _router: Router
  ) {}

  ngOnInit() {
    this._walletStore.connected$
      .pipe(
        filter((connected) => connected),
        take(1)
      )
      .subscribe(() => this._router.navigate(['/']));
  }
}
