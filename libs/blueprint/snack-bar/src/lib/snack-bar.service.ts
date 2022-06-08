import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BlueprintSnackBarComponent } from './snack-bar.component';

@Injectable()
export class BlueprintSnackBarService {
	private readonly _matSnackBar = inject(MatSnackBar);

	notifyError(message: string) {
		this._matSnackBar.openFromComponent(BlueprintSnackBarComponent, {
			duration: 10000,
			data: {
				title: 'Oops!!',
				message,
				type: 'error',
			},
		});
	}

	notifySuccess(message: string) {
		this._matSnackBar.openFromComponent(BlueprintSnackBarComponent, {
			duration: 5000,
			data: {
				title: 'Hooray...',
				message,
				type: 'success',
			},
		});
	}

	notifyWarning(message: string) {
		this._matSnackBar.openFromComponent(BlueprintSnackBarComponent, {
			duration: 5000,
			data: {
				title: 'Huh...',
				message,
				type: 'warning',
			},
		});
	}
}
