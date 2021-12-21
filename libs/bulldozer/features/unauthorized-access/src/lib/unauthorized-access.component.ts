import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';

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
export class UnauthorizedAccessComponent {
  @HostBinding('class') class = 'block';
}
