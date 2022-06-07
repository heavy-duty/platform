import { Dialog } from '@angular/cdk/dialog';
import {
	Directive,
	EventEmitter,
	HostListener,
	Input,
	Output,
	TemplateRef,
} from '@angular/core';
import { Wallet } from '@heavy-duty/wallet-adapter';
import { WalletName } from '@solana/wallet-adapter-base';

@Directive({
	selector: 'button[hdWalletModalButton]',
	standalone: true,
})
export class HdWalletModalButtonDirective {
	@Input() wallets: Wallet[] = [];
	@Input() template: TemplateRef<unknown> | null = null;
	@Input() panelClass = '';
	@Output() selectWallet = new EventEmitter<WalletName>();
	@HostListener('click') onClick(): void {
		if (this.template === null) {
			throw new Error('Component not provided');
		}

		this._dialog
			.open<WalletName, { wallets: Wallet[] }, unknown>(this.template, {
				panelClass: ['wallet-modal', ...this.panelClass.split(' ')],
				maxWidth: '380px',
				maxHeight: '90vh',
				data: {
					wallets: this.wallets || [],
				},
			})
			.closed.subscribe(
				(walletName) => walletName && this.selectWallet.emit(walletName)
			);
	}

	constructor(private readonly _dialog: Dialog) {}
}
