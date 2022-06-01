import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Keypair } from '@solana/web3.js';
import { KeypairsService } from './keypairs.service';

@Component({
  selector: 'crane-keypairs-list',
  template: `
    <section>
      <h3>Keypairs</h3>

      <button mat-raised-button color="primary" (click)="onNewKeypair()">
        New
      </button>

      <ul class="flex flex-col gap-2">
        <li
          *ngFor="let keypair of keypairs$ | async; let i = index"
          class="p-2 flex flex-col gap-2 border-2 border-white"
        >
          <p class="overflow-hidden whitespace-nowrap overflow-ellipsis">
            #{{ i + 1 }} - {{ keypair.publicKey.toBase58() }}
          </p>

          <div class="flex gap-1">
            <button
              mat-raised-button
              color="primary"
              [cdkCopyToClipboard]="keypair.publicKey.toBase58()"
            >
              Copy
            </button>

            <button
              mat-raised-button
              color="accent"
              [disabled]="disabled"
              (click)="onSignTransaction(i)"
            >
              Sign
            </button>

            <button mat-raised-button color="warn" (click)="onRemoveKeypair(i)">
              Remove
            </button>
          </div>
        </li>
      </ul>
    </section>
  `,
})
export class KeypairsSectionComponent {
  @Input() disabled = false;
  @Output() signTransaction = new EventEmitter<Keypair>();

  readonly keypairs$ = this._keypairsService.keypairs$;

  constructor(private readonly _keypairsService: KeypairsService) {}

  onNewKeypair() {
    this._keypairsService.generateKeypair();
  }

  onRemoveKeypair(index: number) {
    this._keypairsService.removeKeypair(index);
  }

  onSignTransaction(index: number) {
    const keypair = this._keypairsService.getKeypair(index);

    if (keypair === null) {
      throw new Error('Invalid signer.');
    }

    this.signTransaction.emit(keypair);
  }
}
