import {
	ChangeDetectionStrategy,
	Component,
	ContentChild,
	ElementRef,
	TemplateRef,
	ViewChild,
} from '@angular/core';
import { HdWalletModalComponent } from './modal.component';

@Component({
	selector: 'hd-wallet-modal-button',
	template: `
		<button
			*hdWalletAdapter="let wallets = wallets; let selectWallet = selectWallet"
			bpButton
			hdWalletModalButton
			className="w-full"
			panelClass="bd-bg-wood bg-bd-brown"
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
})
export class HdWalletModalButtonComponent {
	@ViewChild('template') template: TemplateRef<HdWalletModalComponent> | null =
		null;
	@ContentChild('children') children?: ElementRef;
}
