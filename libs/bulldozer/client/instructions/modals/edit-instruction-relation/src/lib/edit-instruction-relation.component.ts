import { Component, HostBinding, Inject } from '@angular/core';
import {
	UntypedFormControl,
	UntypedFormGroup,
	ValidatorFn,
	Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '@bulldozer-client/notification-snack-bar';
import { List } from 'immutable';
import { InstructionAccount } from './types';

export const equalValidator =
	(a: string, b: string): ValidatorFn =>
	(control) => {
		if (control.get(a)?.value === control.get(b)?.value) {
			return { equal: true };
		}

		return null;
	};

@Component({
	selector: 'bd-edit-relation',
	template: `
		<h2 class="mat-primary bp-font" mat-dialog-title>Create relation</h2>

		<form
			class="flex flex-col gap-4"
			[formGroup]="form"
			(ngSubmit)="onEditAccount()"
		>
			<mat-form-field
				class="w-full"
				appearance="fill"
				hintLabel="Select to account."
			>
				<mat-label>To</mat-label>
				<mat-select formControlName="to">
					<mat-option
						*ngFor="let account of data?.accounts"
						[value]="account.id"
					>
						{{ account.name }} |
						{{ account.id | obscureAddress }}
					</mat-option>
				</mat-select>
				<mat-error *ngIf="submitted">To is required.</mat-error>
			</mat-form-field>

			<mat-error
				*ngIf="submitted && form.hasError('equal')"
				class="text-center m-0"
				>Accounts have to be different.</mat-error
			>

			<div
				class="py-2 px-5 w-full h-12 bg-bp-metal-2 shadow flex justify-center items-center m-auto mt-4 relative bg-bp-black"
			>
				<button class="bp-button flex-1" mat-dialog-close>Cancel</button>
				<button class="bp-button flex-1" [disabled]="submitted && form.invalid">
					Create
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
})
export class EditInstructionRelationComponent {
	@HostBinding('class') class = 'block w-72 relative';
	readonly form: UntypedFormGroup;
	submitted = false;

	constructor(
		private readonly _matSnackBar: MatSnackBar,
		private readonly _matDialogRef: MatDialogRef<EditInstructionRelationComponent>,
		@Inject(MAT_DIALOG_DATA)
		public data: {
			accounts: List<InstructionAccount>;
			from: string;
		}
	) {
		this.form = new UntypedFormGroup(
			{
				from: new UntypedFormControl(this.data.from, {
					validators: [Validators.required],
				}),
				to: new UntypedFormControl(null, { validators: [Validators.required] }),
			},
			{
				validators: [equalValidator('from', 'to')],
			}
		);
	}

	onEditAccount() {
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
