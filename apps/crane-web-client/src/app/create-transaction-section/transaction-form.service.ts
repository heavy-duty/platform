import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { capital } from 'case';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
} from 'rxjs';
import { IdlInstruction, IdlInstructionArgument } from '../plugins';
import { PublicKeyValidator } from '../utils';
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

@Injectable()
export class TransactionFormService {
  private readonly _instructions = new BehaviorSubject<InstructionOption[]>([]);
  private readonly _fields = new BehaviorSubject<FormlyFieldConfig>({
    type: 'stepper',
    fieldGroup: [],
  });
  private readonly _model = new BehaviorSubject<TransactionFormModel>({});
  readonly transactionForm$ = combineLatest({
    fields: this._fields.asObservable().pipe(distinctUntilChanged()),
    model: this._model.asObservable().pipe(distinctUntilChanged()),
  }).pipe(
    map(({ fields, model }) => ({
      fields,
      model,
      form: new FormGroup({}),
    }))
  );

  addInstruction({ instruction, name, namespace }: InstructionOption) {
    const fields = this._fields.getValue();
    const instructions = this._instructions.getValue();
    const model = this._model.getValue();

    this._instructions.next([
      ...instructions,
      { instruction, name, namespace },
    ]);
    this._model.next({
      ...model,
      [`${Object.keys(model).length}`]: {
        name,
        namespace,
        instruction: instruction.name,
        args: {},
        accounts: {},
      },
    });
    this._fields.next({
      ...fields,
      fieldGroup: [...instructions, { instruction, name, namespace }].map(
        ({ namespace, name, instruction }, index) => ({
          id: `${index}`,
          key: `${index}`,
          fieldGroup: toFormlyFields(namespace, name, instruction),
        })
      ),
    });
  }

  removeInstruction(index: number) {
    const fields = this._fields.getValue();
    const model = this._model.getValue();
    const instructions = this._instructions.getValue();

    fields.fieldGroup?.splice(index, 1);

    const newModel: TransactionFormModel = {};

    fields.fieldGroup?.forEach((field, index) => {
      newModel[`${index}`] = model[`${field.key}`];
    });

    instructions.splice(index, 1);

    this._instructions.next(instructions);
    this._model.next(newModel);
    this._fields.next({
      ...fields,
      fieldGroup: instructions.map(
        ({ namespace, name, instruction }, index) => ({
          id: `${index}`,
          key: `${index}`,
          fieldGroup: toFormlyFields(namespace, name, instruction),
        })
      ),
    });
  }

  move(event: CdkDragDrop<string[]>) {
    const fields = this._fields.getValue();
    const instructions = this._instructions.getValue();
    const modelAsArray = Object.values(this._model.getValue());

    moveItemInArray(instructions, event.previousIndex, event.currentIndex);
    moveItemInArray(modelAsArray, event.previousIndex, event.currentIndex);

    this._instructions.next(instructions);
    this._model.next(
      modelAsArray.reduce(
        (model, entry, index) => ({ ...model, [`${index}`]: entry }),
        {}
      )
    );
    this._fields.next({
      ...fields,
      fieldGroup: instructions.map(
        ({ namespace, name, instruction }, index) => ({
          id: `${index}`,
          key: `${index}`,
          fieldGroup: toFormlyFields(namespace, name, instruction),
        })
      ),
    });
  }

  restart() {
    this._fields.next({
      type: 'stepper',
      fieldGroup: [],
    });
    this._instructions.next([]);
    this._model.next({});
  }
}
