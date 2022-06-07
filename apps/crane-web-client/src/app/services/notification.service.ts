import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '../components/snack-bar.component';
import { getErrorMessage } from '../utils';

@Injectable()
export class NotificationService {
	constructor(private readonly _matSnackBar: MatSnackBar) {}

	notifyError(error: unknown) {
		this._matSnackBar.openFromComponent(SnackBarComponent, {
			duration: 10000,
			data: {
				title: 'Oops!!',
				message: getErrorMessage(error),
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
}
