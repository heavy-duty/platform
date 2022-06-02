/* eslint-disable @typescript-eslint/no-explicit-any */
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { TransactionFormService } from './transaction-form.service';

@Component({
	selector: 'crane-formly-field-stepper',
	template: `
		<div
			cdkDropList
			class="flex flex-col gap-4 stepper"
			(cdkDropListDropped)="drop($event)"
		>
			<crane-screwed-card
				class="bg-black bp-bg-metal px-6 py-4 rounded step"
				*ngFor="
					let step of field.fieldGroup;
					let index = index;
					let last = last
				"
				cdkDrag
			>
				<div class="step-placeholder" *cdkDragPlaceholder></div>

				<div
					class="w-full flex justify-between items-center cursor-move"
					cdkDragHandle
				>
					<div class="flex items-center gap-2">
						<div
							class="flex justify-center items-center w-8 h-8 rounded-full bg-black bg-opacity-25 font-bold"
						>
							{{ index + 1 }}
						</div>

						<img
							class="h-5 inline-block"
							[src]="'assets/images/' + model[index].namespace + '.png'"
						/>
						<p>
							<span class="uppercase text-xs">{{ model[index].name }} | </span>
						</p>
						<p>
							<span class="text-base">{{ model[index].instruction }} </span>
						</p>
					</div>

					<button
						mat-icon-button
						(click)="remove(index)"
						craneStopPropagation
						type="button"
					>
						<mat-icon>delete</mat-icon>
					</button>
				</div>

				<crane-screwed-card
					class="bg-black bp-bg-metal-2 px-6 pt-4 pb-8 rounded step w-full block"
				>
					<formly-field [field]="step"></formly-field>
				</crane-screwed-card>

				<crane-screwed-card
					*ngIf="last"
					class="mt-4 bg-black bp-bg-metal-2 px-6 py-4 rounded inline-block"
				>
					<button
						class="bg-black h-full px-6 py-2 bp-button uppercase"
						[disabled]="!form.valid"
						type="submit"
					>
						claim
					</button>
				</crane-screwed-card>
			</crane-screwed-card>
		</div>
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

			.stepper.cdk-drop-list-dragging .step:not(.cdk-drag-placeholder) {
				transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
			}

			.step-placeholder {
				background: #ccc;
				border: dotted 3px #999;
				min-height: 60px;
				transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
			}
		`,
	],
})
export class FormlyFieldStepperComponent extends FieldType {
	constructor(
		private readonly _transactionFormService: TransactionFormService
	) {
		super();
	}

	isValid(field: FormlyFieldConfig): boolean {
		if (field.key) {
			return field.formControl?.valid ?? false;
		}

		return field.fieldGroup
			? field.fieldGroup.every((f) => this.isValid(f))
			: true;
	}

	remove(index: number) {
		this._transactionFormService.removeInstruction(index);
	}

	drop(event: CdkDragDrop<string[]>) {
		this._transactionFormService.move(event);
	}
}
