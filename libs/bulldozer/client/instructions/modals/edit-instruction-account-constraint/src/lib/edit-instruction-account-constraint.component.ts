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
import { InstructionAccountConstraintModel } from '@heavy-duty/bulldozer-devkit';

@Component({
	selector: 'bd-edit-account-constraint',
	template: `
		<h2 class="mat-primary bp-font" mat-dialog-title>
			{{ data?.document ? 'Edit' : 'Create' }} constraint
		</h2>

		<form
			class="flex flex-col gap-4"
			[formGroup]="form"
			(ngSubmit)="onEditDocument()"
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
				<mat-hint align="end">{{ nameControl.value?.length || 0 }}/32</mat-hint>

				<mat-error *ngIf="submitted && nameControl.hasError('required')"
					>The name is mandatory.</mat-error
				>
				<mat-error *ngIf="submitted && nameControl.hasError('maxlength')"
					>Maximum length is 32.</mat-error
				>
			</mat-form-field>

			<mat-form-field
				class="w-full"
				appearance="fill"
				hintLabel="Enter the body."
			>
				<mat-label>Body</mat-label>
				<input
					matInput
					formControlName="body"
					required
					autocomplete="off"
					maxlength="256"
				/>
				<mat-hint align="end"
					>{{ bodyControl.value?.length || 0 }}/256</mat-hint
				>

				<mat-error *ngIf="submitted && bodyControl.hasError('required')"
					>The body is mandatory.</mat-error
				>
				<mat-error *ngIf="submitted && bodyControl.hasError('maxlength')"
					>Maximum length is 256.</mat-error
				>
			</mat-form-field>

			<div
				class="py-2 px-5 w-full h-12 bg-bp-metal-2 shadow flex justify-center items-center m-auto mt-4 relative bg-bp-black"
			>
				<button class="bp-button flex-1" mat-dialog-close>Cancel</button>
				<button class="bp-button flex-1" [disabled]="submitted && form.invalid">
					{{ data?.document ? 'Save' : 'Create' }}
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
	styles: [
		`
			.cdk-drag-preview {
				box-sizing: border-box;
				border-radius: 4px;
				box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
					0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
			}

			.cdk-drag-animating {
				transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
			}

			.seeds.cdk-drop-list-dragging .seed:not(.cdk-drag-placeholder) {
				transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
			}

			.seed-placeholder {
				background: #ccc;
				border: dotted 3px #999;
				min-height: 60px;
				transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditInstructionAccountConstraintComponent {
	@HostBinding('class') class = 'block w-72 relative';
	readonly form: UntypedFormGroup;
	submitted = false;

	get nameControl() {
		return this.form.get('name') as UntypedFormControl;
	}
	get bodyControl() {
		return this.form.get('body') as UntypedFormControl;
	}

	constructor(
		private readonly _matSnackBar: MatSnackBar,
		private readonly _matDialogRef: MatDialogRef<
			EditInstructionAccountConstraintComponent,
			InstructionAccountConstraintModel
		>,
		@Inject(MAT_DIALOG_DATA)
		public data?: {
			document?: InstructionAccountConstraintModel;
		}
	) {
		this.form = new UntypedFormGroup({
			name: new UntypedFormControl(this.data?.document?.name ?? '', {
				validators: [Validators.required],
			}),
			body: new UntypedFormControl(this.data?.document?.body ?? null),
		});
	}

	onEditDocument() {
		this.submitted = true;
		this.form.markAllAsTouched();

		if (this.form.valid) {
			this._matDialogRef.close({
				name: this.nameControl.value,
				body: this.bodyControl.value,
			});
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
