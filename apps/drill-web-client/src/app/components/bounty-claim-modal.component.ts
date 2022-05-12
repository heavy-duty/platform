import { Component } from '@angular/core';
import {
	AbstractControl,
	FormControl,
	FormGroup,
	ValidationErrors,
	ValidatorFn,
	Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { PublicKey } from '@solana/web3.js';

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
							class="rounded bg-bd-black w-full"
						/>
						<div class="form-control-errors text-xs h-4 text-red-400">
							<p
								*ngIf="submitted && form.get('userVault')?.hasError('required')"
							>
								Address is required.
							</p>
							<p
								*ngIf="
									submitted && form.get('userVault')?.hasError('publicKey')
								"
							>
								Make sure to enter a public key.
							</p>
						</div>
					</div>

					<div class="flex">
						<button
							class="flex-1 bg-black py-2 bd-button uppercase text-sm"
							(click)="onClose()"
							type="button"
						>
							close
						</button>
						<button
							class="flex-1 bg-black py-2 bd-button uppercase text-sm"
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
			.form-control-errors > p + p {
				display: none;
			}
		`,
	],
})
export class BountyClaimModalComponent {
	submitted = false;
	readonly form = new FormGroup({
		userVault: new FormControl('', [Validators.required, publicKeyValidator()]),
	});

	constructor(
		private readonly _matDialogRef: MatDialogRef<BountyClaimModalComponent>
	) {}

	onClose() {
		this._matDialogRef.close();
	}

	onSubmit() {
		this.submitted = true;

		if (this.form.invalid) {
			return;
		}

		const { userVault } = this.form.value;

		this._matDialogRef.close(userVault);
	}
}
