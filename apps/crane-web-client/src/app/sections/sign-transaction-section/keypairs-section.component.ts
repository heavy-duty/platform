import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { BlueprintButtonComponent } from '@heavy-duty/blueprint-button';
import { Keypair } from '@solana/web3.js';
import { ScrewedCardComponent } from '../../components';
import { KeypairsService } from '../../services';

@Component({
	selector: 'crane-keypairs-section',
	template: `
		<crane-screwed-card class="bg-black bg-bp-metal-2 px-6 py-4 rounded block">
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
						class="flex items-center gap-2 p-2 bg-black bg-opacity-40 rounded-md"
					>
						<span class="overflow-hidden whitespace-nowrap overflow-ellipsis">
							{{ keypair.publicKey.toBase58() }}
						</span>

						<button [cdkCopyToClipboard]="keypair.publicKey.toBase58()">
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
		</crane-screwed-card>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	imports: [
		CommonModule,
		BlueprintButtonComponent,
		MatIconModule,
		ClipboardModule,
		ScrewedCardComponent,
	],
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
