import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import { IdlInstruction, PluginsService } from '../plugins';

export interface InstructionOption {
	namespace: string;
	name: string;
	instruction: IdlInstruction;
}

@Component({
	selector: 'crane-instruction-autocomplete',
	template: `
		<form class="example-form">
			<mat-form-field class="w-full" appearance="fill">
				<mat-label>Choose an instruction</mat-label>
				<input
					type="text"
					placeholder="Pick one"
					aria-label="Choose an instruction"
					matInput
					[formControl]="searchControl"
					[matAutocomplete]="auto"
				/>
				<mat-autocomplete
					autoActiveFirstOption
					#auto="matAutocomplete"
					(optionSelected)="onInstructionSelected($event.option.value)"
					[displayWith]="displayWith"
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
			</mat-form-field>
		</form>
	`,
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
