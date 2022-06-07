import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '@heavy-duty/blueprint-snack-bar';
import { getErrorMessage } from '../utils';

@Injectable()
export class NotificationService {
	private readonly _matSnackBar = inject(MatSnackBar);

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
