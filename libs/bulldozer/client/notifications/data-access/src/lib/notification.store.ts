import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '@bulldozer-client/notification-snack-bar';
import { AnchorError, ProgramError } from '@heavy-duty/anchor';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { WalletError } from '@solana/wallet-adapter-base';
import { pipe, switchMap, tap } from 'rxjs';

interface ViewModel {
	error: unknown | null;
	event: string | null;
}

const initialState: ViewModel = {
	error: null,
	event: null,
};

@Injectable()
export class NotificationStore extends ComponentStore<ViewModel> {
	private readonly _event$ = this.select(({ event }) => event);
	private readonly _error$ = this.select(({ error }) => error);

	constructor(private readonly _matSnackBar: MatSnackBar) {
		super(initialState);

		this._notifyErrors(this._error$);
		this._notifyEvents(this._event$);
	}

	private readonly _setEvent = this.updater<string | null>((state, event) => ({
		...state,
		event,
	}));

	private readonly _setError = this.updater<unknown>((state, error) => ({
		...state,
		error,
	}));

	private readonly _notifyErrors = this.effect<unknown>(
		pipe(
			isNotNullOrUndefined,
			switchMap((error) =>
				this._matSnackBar
					.openFromComponent(SnackBarComponent, {
						duration: 10000,
						data: {
							title: 'Oops!!',
							message: this.getErrorMessage(error),
							type: 'error',
						},
					})
					.afterDismissed()
			),
			tap(() => this.setError(null))
		)
	);

	private readonly _notifyEvents = this.effect<string | null>(
		pipe(
			isNotNullOrUndefined,
			switchMap((event) =>
				this._matSnackBar
					.openFromComponent(SnackBarComponent, {
						duration: 5000,
						data: {
							title: 'Hooray...',
							message: event,
							type: 'success',
						},
					})
					.afterDismissed()
			),
			tap(() => this.setEvent(null))
		)
	);

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

	setEvent(event: string | null) {
		this._setEvent(event);
	}

	setError(error: unknown) {
		this._setError(error);
	}
}
