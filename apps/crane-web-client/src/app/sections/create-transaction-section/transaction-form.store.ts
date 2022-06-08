import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ComponentStore } from '@ngrx/component-store';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { capital } from 'case';
import { IdlInstruction, IdlInstructionArgument } from '../../plugins';
import { PublicKeyValidator } from '../../utils';
import { InstructionOption } from './instruction-autocomplete.component';

const isRequired = (arg: IdlInstructionArgument) => {
	return typeof arg.type === 'string' || 'defined' in arg.type;
};

const isTypeOf = (arg: IdlInstructionArgument, type: string) => {
	return (
		arg.type === type ||
		(typeof arg.type !== 'string' &&
			'option' in arg.type &&
			arg.type.option === type) ||
		(typeof arg.type !== 'string' &&
			'coption' in arg.type &&
			arg.type.coption === type)
	);
};

const isPublicKey = (arg: IdlInstructionArgument) => {
	return isTypeOf(arg, 'publicKey');
};

const isNumber = (arg: IdlInstructionArgument) => {
	return (
		isTypeOf(arg, 'u8') ||
		isTypeOf(arg, 'u16') ||
		isTypeOf(arg, 'u32') ||
		isTypeOf(arg, 'u64')
	);
};

const getArgumentValidators = (arg: IdlInstructionArgument) => {
	const validators: { [key: string]: unknown } = {};

	if (isRequired(arg)) {
		validators['required'] = {
			expression: (control: FormControl) => control.value !== null,
			message: () => `"${capital(arg.name)}" is mandatory.`,
		};
	}

	if (isPublicKey(arg)) {
		validators['publicKey'] = {
			expression: (control: FormControl) =>
				control.value !== null && PublicKeyValidator(control) === null,
			message: (_: unknown, field: FormlyFieldConfig) =>
				`"${field.formControl?.value}" is not a valid Public Key.`,
		};
	}

	return validators;
};

const getInputType = (arg: IdlInstructionArgument) => {
	if (isPublicKey(arg)) {
		return 'text';
	} else if (isNumber(arg)) {
		return 'number';
	} else {
		return 'text';
	}
};

const getInputDescription = (arg: IdlInstructionArgument) => {
	if (isPublicKey(arg)) {
		return `Enter Public Key for ${capital(arg.name)} argument.`;
	} else if (isNumber(arg)) {
		return `Enter a number for ${capital(arg.name)} argument.`;
	} else {
		return `Enter value for ${capital(arg.name)} argument.`;
	}
};

const toFormlyFields = (
	namespace: string,
	name: string,
	instruction: IdlInstruction
): FormlyFieldConfig[] => {
	return [
		{
			key: 'namespace',
			defaultValue: namespace,
			templateOptions: {
				readonly: true,
			},
		},
		{
			key: 'name',
			defaultValue: name,
			templateOptions: {
				readonly: true,
			},
		},
		{
			key: 'instruction',
			defaultValue: instruction.name,
			templateOptions: {
				readonly: true,
			},
		},
		{
			key: 'accounts',
			templateOptions: { label: 'Accounts' },
			fieldGroup: instruction.accounts.map((account) => ({
				key: account.name,
				type: 'input',
				className: 'block mt-4',
				templateOptions: {
					label: capital(account.name),
					placeholder: capital(account.name),
					description: `Enter Public Key for ${capital(account.name)} account.`,
					required: true,
				},
				validators: {
					required: {
						expression: (control: FormControl) => control.value !== null,
						message: () => `"${capital(account.name)}" is mandatory.`,
					},
					publicKey: {
						expression: (control: FormControl) =>
							control.value !== null && PublicKeyValidator(control) === null,
						message: (_: unknown, field: FormlyFieldConfig) =>
							`"${field.formControl?.value}" is not a valid Public Key.`,
					},
				},
			})),
		},
		{
			key: 'args',
			templateOptions: { label: 'Args' },
			fieldGroup: instruction.args.map((arg) => ({
				key: arg.name,
				type: 'input',
				className: 'block mt-4',
				templateOptions: {
					label: capital(arg.name),
					placeholder: capital(arg.name),
					type: getInputType(arg),
					required: isRequired(arg),
					description: getInputDescription(arg),
				},
				validators: getArgumentValidators(arg),
			})),
		},
	];
};

export type TransactionFormModel = {
	[key: string]: {
		namespace: string;
		name: string;
		instruction: string;
		accounts: { [accountName: string]: string };
		args: { [argName: string]: string };
	};
};

interface ViewModel {
	instructions: InstructionOption[];
	fields: FormlyFieldConfig;
	model: TransactionFormModel;
}

const initialState: ViewModel = {
	instructions: [],
	fields: {
		type: 'transaction',
		fieldGroup: [],
	},
	model: {},
};

@Injectable()
export class TransactionFormStore extends ComponentStore<ViewModel> {
	readonly transactionForm$ = this.select(
		this.select(({ fields }) => fields),
		this.select(({ model }) => model),
		(fields, model) => ({
			fields,
			model,
			form: new FormGroup({}),
		})
	);

	constructor() {
		super(initialState);
	}

	readonly addInstruction = this.updater<InstructionOption>(
		({ fields, instructions, model }, { instruction, name, namespace }) => ({
			instructions: [...instructions, { instruction, name, namespace }],
			model: {
				...model,
				[`${Object.keys(model).length}`]: {
					name,
					namespace,
					instruction: instruction.name,
					args: {},
					accounts: {},
				},
			},
			fields: {
				...fields,
				fieldGroup: [...instructions, { instruction, name, namespace }].map(
					({ namespace, name, instruction }, index) => ({
						id: `${index}`,
						key: `${index}`,
						fieldGroup: toFormlyFields(namespace, name, instruction),
					})
				),
			},
		})
	);

	readonly removeInstruction = this.updater<number>(
		({ fields, instructions, model }, index) => {
			fields.fieldGroup?.splice(index, 1);

			const newModel: TransactionFormModel = {};

			fields.fieldGroup?.forEach((field, index) => {
				newModel[`${index}`] = model[`${field.key}`];
			});

			instructions.splice(index, 1);

			return {
				instructions,
				model: newModel,
				fields: {
					...fields,
					fieldGroup: instructions.map(
						({ namespace, name, instruction }, index) => ({
							id: `${index}`,
							key: `${index}`,
							fieldGroup: toFormlyFields(namespace, name, instruction),
						})
					),
				},
			};
		}
	);

	readonly move = this.updater<CdkDragDrop<string[]>>((state, event) => {
		const instructions = [...state.instructions];
		const modelAsArray = Object.values(state.model);

		moveItemInArray(instructions, event.previousIndex, event.currentIndex);
		moveItemInArray(modelAsArray, event.previousIndex, event.currentIndex);

		return {
			...state,
			instructions,
			model: modelAsArray.reduce(
				(model, entry, index) => ({ ...model, [`${index}`]: entry }),
				{}
			),
			fields: {
				...state.fields,
				fieldGroup: instructions.map(
					({ namespace, name, instruction }, index) => ({
						id: `${index}`,
						key: `${index}`,
						fieldGroup: toFormlyFields(namespace, name, instruction),
					})
				),
			},
		};
	});

	readonly restart = this.updater<void>(() => initialState);
}
