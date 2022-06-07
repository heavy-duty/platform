import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	ContentChild,
	ElementRef,
	Input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import {
	HdWalletAdapterDirective,
	HdWalletIconComponent,
} from '@heavy-duty/wallet-adapter-cdk';
import { HdWalletModalButtonDirective } from './modal-button.directive';
import { HdWalletModalComponent } from './modal.component';
import { ButtonColor } from './types';

@Component({
	selector: 'hd-wallet-modal-button',
	template: `
		<button
			*hdWalletAdapter="let wallets = wallets; let selectWallet = selectWallet"
			mat-raised-button
			[color]="color"
			hdWalletModalButton
			[wallets]="wallets"
			(selectWallet)="selectWallet($event)"
		>
			<ng-content></ng-content>
			<ng-container *ngIf="!children">Select Wallet</ng-container>
		</button>
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
		HdWalletAdapterDirective,
		HdWalletIconComponent,
		HdWalletModalButtonDirective,
		HdWalletModalComponent,
		MatButtonModule,
		MatDialogModule,
	],
})
export class HdWalletModalButtonComponent {
	@ContentChild('children') children: ElementRef | null = null;
	@Input() color: ButtonColor = 'primary';
}
