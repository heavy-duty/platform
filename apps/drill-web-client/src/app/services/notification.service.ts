import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AnchorError, ProgramError } from '@heavy-duty/anchor';
import { WalletError } from '@solana/wallet-adapter-base';
import { SnackBarComponent } from '../components/snack-bar.component';

@Injectable({ providedIn: 'root' })
export class NotificationService {
	constructor(private readonly _matSnackBar: MatSnackBar) {}

	notifyError(error: unknown) {
		this._matSnackBar.openFromComponent(SnackBarComponent, {
			duration: 10000,
			data: {
				title: 'Oops!!',
				message: this.getErrorMessage(error),
				type: 'error',
			},
		});
	}

	notifySuccess(message: string) {
		console.log('alooo');
		this._matSnackBar.openFromComponent(SnackBarComponent, {
			data: {
				title: 'Hooray...',
				message,
				type: 'success',
			},
		});
	}

	private getErrorMessage(error: unknown) {
		if (typeof error === 'string') {
			return error;
		} else if (error instanceof WalletError) {
			return error.name;
		} else if (error instanceof ProgramError) {
			return error.message;
		} else if (error instanceof AnchorError) {
			return error.error.errorMessage;
		} else {
			try {
				console.error(error);
			} catch (error) {
				throw new Error('Console not available');
			}
			return 'Unknown error';
		}
	}
}
