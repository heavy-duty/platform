import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Keypair } from '@solana/web3.js';
import { KeypairsService } from './keypairs.service';

@Component({
	selector: 'crane-keypairs-list',
	template: `
		<section>
			<header class="flex justify-between items-center">
				<h2 class="text-xl">Keypairs</h2>
				<button
					class="bg-black h-full p-1 bp-button uppercase text-xs"
					(click)="onNewKeypair()"
				>
					New <mat-icon inline>add_circle</mat-icon>
				</button>
			</header>

			<ul class="flex flex-col gap-2">
				<li
					*ngFor="let keypair of keypairs$ | async; let i = index"
					class="flex flex-col gap-2 mt-2"
				>
					<p
						class="flex items-center gap-2 px-2 bg-black bg-opacity-40 rounded-md"
					>
						<span class="overflow-hidden whitespace-nowrap overflow-ellipsis">
							{{ keypair.publicKey.toBase58() }}
						</span>

						<button
							mat-icon-button
							[cdkCopyToClipboard]="keypair.publicKey.toBase58()"
						>
							<mat-icon>content_copy</mat-icon>
						</button>
					</p>

					<div class="flex justify-end gap">
						<button
							class="bg-black h-full p-1 bp-button uppercase text-xs"
							[disabled]="disabled"
							(click)="onSignTransaction(i)"
						>
							Sign <mat-icon inline>check_circle</mat-icon>
						</button>

						<button
							class="bg-black h-full p-1 bp-button uppercase text-xs text-red-500"
							(click)="onRemoveKeypair(i)"
						>
							Delete <mat-icon inline>delete</mat-icon>
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
