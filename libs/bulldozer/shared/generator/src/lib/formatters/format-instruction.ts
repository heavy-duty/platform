import {
	Document,
	Instruction,
	InstructionAccount,
	InstructionArgument,
	InstructionRelation,
	Relation,
} from '@heavy-duty/bulldozer-devkit';
import { List } from 'immutable';
import {
	capitalize,
	CollectionItemView,
	FormattedName,
	InstructionAccountItemView,
	InstructionAccountRelationItemView,
	InstructionArgumentItemView,
	InstructionViewItem,
} from '../utils';
import { formatName } from './format-name';

const getArgumentKindName = (id: number, name: string, size: number) => {
	if (id === 0) {
		return 'bool';
	} else if (id === 1) {
		if (size <= 256) {
			return 'u8';
		} else if (size > 256 && size <= 65536) {
			return 'u16';
		} else if (size > 65536 && size <= 4294967296) {
			return 'u32';
		} else {
			throw Error('Invalid max');
		}
	} else if (id === 2 || id === 3) {
		return capitalize(name);
	} else {
		throw Error('Invalid kind');
	}
};

export const formatInstructionArguments = (
	instructionId: string,
	instructionArguments: Document<InstructionArgument>[]
) =>
	instructionArguments
		.filter((argument) => argument.data.instruction === instructionId)
		.map((argument) => ({
			id: argument.id,
			name: formatName(argument.name),
			data: {
				...argument.data,
				kind: {
					...argument.data.kind,
					name: getArgumentKindName(
						argument.data.kind.id,
						argument.data.kind.name,
						argument.data.kind.size
					),
				},
			},
		}));

const getInstructionAccountRelations = (
	instructionAccount: Document<InstructionAccount>,
	instructionAccounts: Document<InstructionAccount>[],
	instructionRelations: Relation<InstructionRelation>[]
) => {
	return instructionRelations
		.filter((relation) => relation.from === instructionAccount.id)
		.map((relation) => {
			const toAccount = instructionAccounts.find(
				({ id }) => id === relation.to
			);

			if (!toAccount) {
				return null;
			}

			return {
				...relation,
				data: {
					...relation.data,
					toAccount: {
						...toAccount,
						name: formatName(toAccount.name),
					},
				},
			};
		})
		.filter(
			(
				relation
			): relation is Relation<InstructionRelation> & {
				data: {
					toAccount: Document<InstructionAccount> & { name: FormattedName };
				};
			} => relation !== null
		);
};

const getInstructionAccountPayer = () =>
	/* instructionAccount: Document<InstructionAccount>,
  instructionAccounts: Document<InstructionAccount>[] */
	{
		return null;
		/* if (!instructionAccount.data.modifier?.payer) {
    return null;
  }

  const payerAccount = instructionAccounts.find(
    ({ id }) => id === instructionAccount.data.modifier?.payer
  );

  if (!payerAccount) {
    return null;
  }

  return {
    ...payerAccount,
    name: formatName(payerAccount.name),
  }; */
	};

const getInstructionAccountCollection = () =>
	/* instructionAccount: Document<InstructionAccount>,
  collections: Document<Collection>[] */
	{
		return null;
		/* if (!instructionAccount.data.kind.collection) {
    return null;
  }

  const collectionAccount = collections.find(
    ({ id }) => id === instructionAccount.data.kind.collection
  );

  if (!collectionAccount) {
    return null;
  }

  return {
    ...collectionAccount,
    name: formatName(collectionAccount.name),
  }; */
	};

const getInstructionAccountClose = () =>
	/* instructionAccount: Document<InstructionAccount>,
  instructionAccounts: Document<InstructionAccount>[] */
	{
		return null;
		/* if (!instructionAccount.data.modifier?.close) {
    return null;
  }

  const closeAccount = instructionAccounts.find(
    ({ id }) => id === instructionAccount.data.modifier?.close
  );

  if (!closeAccount) {
    return null;
  }

  return {
    ...closeAccount,
    name: formatName(closeAccount.name),
  }; */
	};

const formatInstructionAccounts = (
	instructionId: string,
	instructionAccounts: Document<InstructionAccount>[],
	instructionRelations: Relation<InstructionRelation>[]
	// collections: Document<Collection>[]
) =>
	instructionAccounts
		.filter(
			(instructionAccount) =>
				instructionAccount.data.instruction === instructionId
		)
		.map((instructionAccount) => ({
			id: instructionAccount.id,
			name: formatName(instructionAccount.name),
			data: {
				...instructionAccount.data,
				collection: getInstructionAccountCollection(),
				/* instructionAccount,
          collections */
				close: getInstructionAccountClose(),
				/* instructionAccount,
          instructionAccounts */
				payer: getInstructionAccountPayer(),
				/* instructionAccount,
          instructionAccounts */
				relations: getInstructionAccountRelations(
					instructionAccount,
					instructionAccounts,
					instructionRelations
				),
				space: instructionAccount.data.space,
			},
		}));

export const formatInstruction = (
	instruction: Document<Instruction>,
	instructionArguments: Document<InstructionArgument>[],
	instructionAccounts: Document<InstructionAccount>[],
	instructionRelations: Relation<InstructionRelation>[]
	// collections: Document<Collection>[]
) => ({
	name: formatName(instruction.name),
	handler: instruction.data.body.split('\n'),
	initializesAccount: instructionAccounts.some(
		(account) => account.data.modifier?.id === 0
	),
	arguments: formatInstructionArguments(instruction.id, instructionArguments),
	accounts: formatInstructionAccounts(
		instruction.id,
		instructionAccounts,
		instructionRelations
		// collections
	),
});

/// new version

const formatInstructionAccounts2 = (
	instructionAccounts: List<InstructionAccountItemView>,
	instructionRelations: List<InstructionAccountRelationItemView>,
	collections: List<CollectionItemView>
) => {
	return instructionAccounts.map((instructionAccount) => {
		const collection = collections.find(
			({ id }) => id === instructionAccount.collection
		);
		const close = instructionAccounts.find(
			({ id }) => id === instructionAccount.close
		);
		const payer = instructionAccounts.find(
			({ id }) => id === instructionAccount.payer
		);

		return {
			id: instructionAccount.id,
			name: formatName(instructionAccount.name),
			collection:
				collection !== undefined ? formatName(collection.name) : undefined,
			close: close !== undefined ? formatName(close.name) : undefined,
			payer: payer !== undefined ? formatName(payer.name) : undefined,
			space: instructionAccount.space,
			kind: instructionAccount.kind,
			modifier: instructionAccount.modifier,
			relations: instructionRelations
				.filter(
					(instructionRelation) =>
						instructionRelation.from === instructionAccount.id
				)
				.map((instructionRelation) => {
					const toAccount = instructionAccounts.find(
						({ id }) => id === instructionRelation.to
					);

					if (toAccount === undefined) {
						return null;
					}

					return formatName(toAccount.name);
				})
				.filter(
					(instructionRelation): instructionRelation is FormattedName =>
						instructionRelation !== null
				),
		};
	});
};

export const formatInstructionArguments2 = (
	instructionArguments: List<InstructionArgumentItemView>
) =>
	instructionArguments.map((argument) => ({
		name: formatName(argument.name),
		kind: {
			...argument.kind,
			name: getArgumentKindName(
				argument.kind.id,
				argument.kind.name,
				argument.kind.size
			),
		},
		modifier: argument.modifier,
	}));

export const formatInstruction2 = (
	instruction: InstructionViewItem,
	instructionArguments: List<InstructionArgumentItemView>,
	instructionAccounts: List<InstructionAccountItemView>,
	instructionRelations: List<InstructionAccountRelationItemView>,
	collections: List<CollectionItemView>
) => ({
	name: formatName(instruction.name),
	handler: instruction.body.split('\n'),
	initializesAccount: instructionAccounts.some(
		(account) => account.modifier?.id === 0
	),
	arguments: formatInstructionArguments2(instructionArguments),
	accounts: formatInstructionAccounts2(
		instructionAccounts,
		instructionRelations,
		collections
	),
});
