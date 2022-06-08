import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import {
	UntypedFormControl,
	UntypedFormGroup,
	Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '@bulldozer-client/notification-snack-bar';
import { publicKeyValidator } from './public-key.validator';

@Component({
	selector: 'bd-import-workspace',
	template: `
		<h2 class="mat-primary bp-font" mat-dialog-title>Import Workspace</h2>

		<form
			class="flex flex-col gap-4"
			[formGroup]="form"
			(ngSubmit)="onImportWorkspace()"
		>
			<mat-form-field
				class="w-full"
				appearance="fill"
				hintLabel="Enter the public key."
			>
				<mat-label>Workspace Public Key</mat-label>
				<input matInput formControlName="pubkey" required autocomplete="off" />

				<mat-error
					*ngIf="submitted && this.form.get('pubkey')?.hasError('required')"
					>The pubkey is mandatory.</mat-error
				>
				<mat-error
					*ngIf="submitted && this.form.get('pubkey')?.hasError('publicKey')"
					>The pubkey format is incorrect.</mat-error
				>
			</mat-form-field>

			<div
				class="py-2 px-5 w-full h-12 bg-bp-metal-2 shadow flex justify-center items-center m-auto mt-4 relative bg-bp-black"
			>
				<button class="bp-button flex-1" mat-dialog-close>Cancel</button>
				<button class="bp-button flex-1" [disabled]="submitted && form.invalid">
					Import
				</button>
				<div
					class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-5 left-2"
				>
					<div class="w-full h-px bg-gray-600 rotate-45"></div>
				</div>
				<div
					class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-5 right-2"
				>
					<div class="w-full h-px bg-gray-600 rotate-12"></div>
				</div>
			</div>
		</form>
	`,
	styles: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportWorkspaceComponent {
	@HostBinding('class') class = 'block w-72 relative';
	readonly form: UntypedFormGroup;
	submitted = false;

	constructor(
		private readonly _matSnackBar: MatSnackBar,
		private readonly _matDialogRef: MatDialogRef<ImportWorkspaceComponent>
	) {
		this.form = new UntypedFormGroup({
			pubkey: new UntypedFormControl(null, {
				validators: [Validators.required, publicKeyValidator()],
			}),
		});
	}

	onImportWorkspace() {
		this.submitted = true;
		this.form.markAllAsTouched();

		if (this.form.valid) {
			this._matDialogRef.close(this.form.value);
		} else {
			this._matSnackBar.openFromComponent(SnackBarComponent, {
				duration: 5000,
				data: {
					title: 'Heey...',
					message: 'Invalid Information',
					type: 'warning',
				},
			});
		}
	}
}
