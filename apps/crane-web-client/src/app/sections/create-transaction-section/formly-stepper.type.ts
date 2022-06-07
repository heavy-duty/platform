/* eslint-disable @typescript-eslint/no-explicit-any */
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { BlueprintScrewCardComponent } from '@heavy-duty/blueprint-card';
import { FieldType, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { StopPropagationDirective } from '../../directives';
import { TransactionFormService } from './transaction-form.service';

@Component({
	selector: 'crane-formly-field-stepper',
	template: `
		<div
			class="flex flex-col gap-4 stepper"
			(cdkDropListDropped)="drop($event)"
			cdkDropList
		>
			<bp-screw-card
				*ngFor="
					let step of field.fieldGroup;
					let index = index;
					let last = last
				"
				class="bg-black bg-bp-metal px-6 py-4 rounded step"
				cdkDrag
			>
				<div *cdkDragPlaceholder class="step-placeholder"></div>

				<div
					class="w-full flex justify-between items-center cursor-move mb-4 gap-4"
					cdkDragHandle
				>
					<bp-screw-card
						class="bg-black bg-bp-metal-2 px-6 py-4 rounded flex-1"
					>
						<div class="flex items-center gap-2">
							<div
								class="flex justify-center items-center w-8 h-8 rounded-full bg-black bg-opacity-40 font-bold"
							>
								{{ index + 1 }}
							</div>

							<img
								class="h-5 inline-block"
								[src]="'assets/images/' + model[index].namespace + '.png'"
							/>
							<p>
								<span class="uppercase text-sm"
									>{{ model[index].name }} |
								</span>
							</p>
							<p>
								<span class="text-lg">{{ model[index].instruction }} </span>
							</p>
						</div>
					</bp-screw-card>

					<bp-screw-card
						class="bg-black bg-bp-metal-2 px-8 py-4 rounded inline-block"
					>
						<button
							class="bg-black h-full p-1 bp-button uppercase text-sm text-red-500"
							(click)="remove(index)"
							type="button"
							craneStopPropagation
						>
							Delete <mat-icon inline>delete</mat-icon>
						</button>
					</bp-screw-card>
				</div>

				<bp-screw-card
					class="bg-black bg-bp-metal-2 px-6 pt-4 pb-8 rounded step w-full block"
				>
					<formly-field [field]="step"></formly-field>
				</bp-screw-card>

				<bp-screw-card
					*ngIf="last"
					class="mt-4 bg-black bg-bp-metal-2 px-6 py-4 rounded inline-block"
				>
					<button
						class="bg-black h-full px-6 py-2 bp-button uppercase"
						[disabled]="!form.valid"
						type="submit"
					>
						submit
					</button>
				</bp-screw-card>
			</bp-screw-card>
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
	standalone: true,
	imports: [
		CommonModule,
		DragDropModule,
		StopPropagationDirective,
		BlueprintScrewCardComponent,
		FormlyModule,
		MatIconModule,
	],
})
export class FormlyFieldStepperComponent extends FieldType {
	private readonly _transactionFormService = inject(TransactionFormService);

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
