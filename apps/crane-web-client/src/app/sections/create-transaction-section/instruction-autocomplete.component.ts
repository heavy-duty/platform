import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	OnInit,
	Output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BlueprintScrewCardComponent } from '@heavy-duty/blueprint-card';
import { map, Observable, startWith } from 'rxjs';
import { IdlInstruction, PluginsService } from '../../plugins';

export interface InstructionOption {
	namespace: string;
	name: string;
	instruction: IdlInstruction;
}

@Component({
	selector: 'crane-instruction-autocomplete',
	template: `
		<bp-screw-card class="bg-black bg-bp-metal px-6 py-4 rounded block mb-4">
			<bp-screw-card class="bg-black bg-bp-metal-2 px-6 py-4 rounded block">
				<mat-form-field class="w-full mb-0" appearance="fill">
					<mat-label>Choose an instruction</mat-label>
					<input
						[formControl]="searchControl"
						[matAutocomplete]="auto"
						type="text"
						placeholder="Pick one"
						aria-label="Choose an instruction"
						matInput
					/>
				</mat-form-field>
			</bp-screw-card>
		</bp-screw-card>

		<mat-autocomplete
			#auto="matAutocomplete"
			[displayWith]="displayWith"
			(optionSelected)="onInstructionSelected($event.option.value)"
			autoActiveFirstOption
		>
			<mat-option
				*ngFor="let option of filteredOptions | async"
				[value]="option"
			>
				<div class="flex justify-start gap-2 items-center">
					<img
						class="h-5 inline-block"
						[src]="'assets/images/' + option.namespace + '.png'"
					/>

					<p>
						<span class="uppercase text-xs">{{ option.name }} | </span>
					</p>
					<p>
						{{ option.instruction.name }}
					</p>
				</div>
			</mat-option>
		</mat-autocomplete>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatAutocompleteModule,
		MatFormFieldModule,
		MatInputModule,
		BlueprintScrewCardComponent,
	],
})
export class InstructionAutocompleteComponent implements OnInit {
	searchControl = new FormControl();
	options = this._pluginsService.plugins.reduce(
		(options: InstructionOption[], plugin) => [
			...options,
			...plugin.instructions.map((instruction) => ({
				namespace: plugin.namespace,
				name: plugin.name,
				instruction,
			})),
		],
		[]
	);

	filteredOptions: Observable<InstructionOption[]> | null = null;

	@Output() instructionSelected = new EventEmitter<InstructionOption>();

	constructor(private readonly _pluginsService: PluginsService) {}

	ngOnInit() {
		this.filteredOptions = this.searchControl.valueChanges.pipe(
			startWith(null),
			map((value) => this._filter(value))
		);
	}

	private _filter(value: string | InstructionOption | null) {
		if (value === null) {
			return this.options;
		} else if (typeof value === 'string') {
			const segments = value.toLowerCase().split(' ');

			return this.options.filter((option) => {
				return segments.every(
					(segment) =>
						option.name.toLowerCase().includes(segment) ||
						option.instruction.name.toLowerCase().includes(segment)
				);
			});
		} else {
			return [value];
		}
	}

	onInstructionSelected(instruction: InstructionOption) {
		this.searchControl.setValue(null);
		this.instructionSelected.emit(instruction);
	}

	displayWith(data: InstructionOption | null) {
		return data ? data.name + ' ' + data.instruction.name : '';
	}
}
