import { Component, Inject } from '@angular/core';
import {
	AbstractControl,
	AsyncValidatorFn,
	UntypedFormControl,
	UntypedFormGroup,
	ValidationErrors,
	ValidatorFn,
	Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Account } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { map, Observable } from 'rxjs';
import { DrillApiService } from '../services/drill-api.service';
import { NotificationService } from '../services/notification.service';
import { Option } from '../types';

export function publicKeyValidator(): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		let error;

		try {
			new PublicKey(control.value);
		} catch (err) {
			error = err;
		}

		return error ? { publicKey: true } : null;
	};
}

export class AssociatedTokenAccountValidator {
	static createValidator(
		drillApiService: DrillApiService,
		mint: PublicKey
	): AsyncValidatorFn {
		return (control: AbstractControl): Observable<Option<ValidationErrors>> => {
			return drillApiService
				.getAssociatedTokenAccount(new PublicKey(control.value), mint)
				.pipe(
					map((result: Option<Account>) =>
						result === null ? { associatedTokenAccount: true } : null
					)
				);
		};
	}
}

@Component({
	selector: 'drill-bounty-claim-modal',
	template: `
		<header>
			<h1 class="bp-font text-xl">Receiver Address</h1>
		</header>

		<main>
			<drill-screwed-card class="bg-gray-800 px-6 py-4 rounded">
				<form
					[formGroup]="form"
					(ngSubmit)="onSubmit()"
					class="flex flex-col gap-2 w-64"
				>
					<div class="form-control flex flex-col gap-1">
						<label class="block text-sm">Address *</label>
						<input
							type="text"
							formControlName="userVault"
							class="rounded bg-bp-black w-full py-1 px-2"
						/>
						<div class="form-control-message h-4">
							<p
								*ngIf="submitted && form.get('userVault')?.hasError('required')"
								class="text-xs text-red-500"
							>
								Address is required.
							</p>
							<p
								*ngIf="
									submitted && form.get('userVault')?.hasError('publicKey')
								"
								class="text-xs text-red-500"
							>
								Wrong format for public key.
							</p>
							<p
								*ngIf="
									submitted &&
									form.get('userVault')?.hasError('associatedTokenAccount')
								"
								class="text-xs text-red-500"
							>
								Missing required token account.
							</p>

							<p
								*ngIf="form.get('userVault')?.pending"
								class="text-xs text-green-500 flex items-center gap-1"
							>
								<span
									class="inline-block h-2 w-2 border-2 border-accent"
									drillProgressSpinner
								></span>
								<span>Fetching token account...</span>
							</p>
						</div>
					</div>

					<div class="flex">
						<button
							class="flex-1 bg-black py-2 bp-button uppercase text-sm"
							(click)="onClose()"
							type="button"
						>
							close
						</button>
						<button
							class="flex-1 bg-black py-2 bp-button uppercase text-sm"
							[disabled]="form.get('userVault')?.pending"
							type="submit"
						>
							Submit
						</button>
					</div>
				</form>
			</drill-screwed-card>
		</main>
	`,
	styles: [
		`
			.form-control-message > p + p {
				display: none;
			}
		`,
	],
})
export class BountyClaimModalComponent {
	submitted = false;
	readonly form = new UntypedFormGroup({
		userVault: new UntypedFormControl('', {
			validators: [Validators.required, publicKeyValidator()],
			asyncValidators: [
				AssociatedTokenAccountValidator.createValidator(
					this._drillApiService,
					this.data.acceptedMint
				),
			],
		}),
	});

	constructor(
		private readonly _matDialogRef: MatDialogRef<BountyClaimModalComponent>,
		private readonly _drillApiService: DrillApiService,
		private readonly _notificationService: NotificationService,
		@Inject(MAT_DIALOG_DATA) public data: { acceptedMint: PublicKey }
	) {}

	onClose() {
		this._matDialogRef.close();
	}

	onSubmit() {
		this.submitted = true;

		if (this.form.invalid) {
			this._notificationService.notifyWarning('Invalid receiver address.');
			return;
		}

		const { userVault } = this.form.value;

		this._matDialogRef.close(userVault);
	}
}
