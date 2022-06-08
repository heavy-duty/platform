import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	Inject,
} from '@angular/core';
import {
	UntypedFormControl,
	UntypedFormGroup,
	Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackBarComponent } from '@bulldozer-client/notification-snack-bar';
import { UserDto } from '@heavy-duty/bulldozer-devkit';

@Component({
	selector: 'bd-edit-user',
	template: `
		<h2 class="mat-primary bp-font" mat-dialog-title>
			{{ user ? 'Edit' : 'Create' }} user
		</h2>

		<form
			class="flex flex-col gap-4"
			[formGroup]="form"
			(ngSubmit)="onEditUser()"
		>
			<mat-form-field
				class="w-full"
				appearance="fill"
				hintLabel="Enter the name."
			>
				<mat-label>Name</mat-label>
				<input
					matInput
					formControlName="name"
					required
					autocomplete="off"
					maxlength="32"
				/>
				<mat-hint align="end"
					>{{ this.form.get('name')?.value?.length || 0 }}/32</mat-hint
				>

				<mat-error
					*ngIf="submitted && this.form.get('name')?.hasError('required')"
					>The name is mandatory.</mat-error
				>
				<mat-error
					*ngIf="submitted && this.form.get('name')?.hasError('maxlength')"
					>Maximum length is 32.</mat-error
				>
			</mat-form-field>

			<mat-form-field
				class="w-full"
				appearance="fill"
				hintLabel="Enter the username."
			>
				<mat-label>Username</mat-label>
				<input
					matInput
					formControlName="userName"
					required
					autocomplete="off"
					maxlength="15"
				/>
				<mat-hint align="end"
					>{{ this.form.get('userName')?.value?.length || 0 }}/15</mat-hint
				>

				<mat-error
					*ngIf="submitted && this.form.get('userName')?.hasError('required')"
					>The username is mandatory.</mat-error
				>
				<mat-error
					*ngIf="submitted && this.form.get('userName')?.hasError('maxlength')"
					>Maximum length is 15.</mat-error
				>
			</mat-form-field>

			<mat-form-field
				class="w-full"
				appearance="fill"
				hintLabel="Enter the thumbnail URL."
			>
				<mat-label>Thumbnail URL</mat-label>
				<input
					matInput
					formControlName="thumbnailUrl"
					required
					autocomplete="off"
					maxlength="300"
				/>
				<mat-hint align="end"
					>{{ this.form.get('thumbnailUrl')?.value?.length || 0 }}/300</mat-hint
				>

				<mat-error
					*ngIf="
						submitted && this.form.get('thumbnailUrl')?.hasError('required')
					"
					>The thumbnail url is mandatory.</mat-error
				>
				<mat-error
					*ngIf="
						submitted && this.form.get('thumbnailUrl')?.hasError('maxlength')
					"
					>Maximum length is 300.</mat-error
				>
			</mat-form-field>

			<div
				class="py-2 px-5 w-full h-12 bg-bp-metal-2 shadow flex justify-center items-center m-auto mt-4 relative bg-bp-black"
			>
				<button class="bp-button flex-1" mat-dialog-close>Cancel</button>
				<button class="bp-button flex-1" [disabled]="submitted && form.invalid">
					{{ user ? 'Save' : 'Create' }}
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
export class EditUserComponent {
	@HostBinding('class') class = 'block w-72 relative';
	readonly form: UntypedFormGroup;
	submitted = false;

	constructor(
		private readonly _matSnackBar: MatSnackBar,
		private readonly _matDialogRef: MatDialogRef<EditUserComponent>,
		@Inject(MAT_DIALOG_DATA)
		public user?: UserDto
	) {
		this.form = new UntypedFormGroup({
			name: new UntypedFormControl(this.user?.name ?? '', {
				validators: [Validators.required, Validators.maxLength(32)],
			}),
			userName: new UntypedFormControl(this.user?.userName ?? '', {
				validators: [Validators.required, Validators.maxLength(15)],
			}),
			thumbnailUrl: new UntypedFormControl(this.user?.thumbnailUrl ?? '', {
				validators: [Validators.required, Validators.maxLength(300)],
			}),
		});
	}

	onEditUser() {
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
