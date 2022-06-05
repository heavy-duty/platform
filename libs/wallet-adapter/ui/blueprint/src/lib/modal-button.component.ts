import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	ContentChild,
	ElementRef,
} from '@angular/core';
import { BlueprintButtonModule } from '@heavy-duty/blueprint-button';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
import { HdWalletModalComponent } from './modal.component';

@Component({
	selector: 'hd-wallet-modal-button',
	template: `
		<button
			*hdWalletAdapter="let wallets = wallets; let selectWallet = selectWallet"
			bpButton
			hdWalletModalButton
			class="w-full"
			panelClass="bp-bg-wood bg-bd-brown"
			[wallets]="wallets"
			[template]="template"
			(selectWallet)="selectWallet($event)"
		>
			<ng-content></ng-content>
			<ng-container *ngIf="!children">Select Wallet</ng-container>
		</button>

		<ng-template #template>
			<hd-wallet-modal></hd-wallet-modal>
		</ng-template>
	`,
	styles: [
		`
			button {
				display: inline-block;
			}

			.button-content {
				display: flex;
				gap: 0.5rem;
				align-items: center;
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	imports: [
		CommonModule,
		HdWalletAdapterCdkModule,
		HdWalletModalComponent,
		BlueprintButtonModule,
	],
})
export class HdWalletModalButtonComponent {
	@ContentChild('children') children?: ElementRef;
}
