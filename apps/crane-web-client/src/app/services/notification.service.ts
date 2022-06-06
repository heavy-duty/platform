import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
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
		this._matSnackBar.openFromComponent(SnackBarComponent, {
			duration: 5000,
			data: {
				title: 'Hooray...',
				message,
				type: 'success',
			},
		});
	}

	notifyWarning(message: string) {
		this._matSnackBar.openFromComponent(SnackBarComponent, {
			duration: 5000,
			data: {
				title: 'Huh...',
				message,
				type: 'warning',
			},
		});
	}

	private getErrorMessage(error: unknown) {
		if (typeof error === 'string') {
			return error;
		} else if (error instanceof Error) {
			if (error.message.includes('failed to send transaction:')) {
				return error.message.split(': ')[2];
			} else {
				return error.message;
			}
		} else if (error instanceof HttpErrorResponse) {
			return error.error.error;
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
