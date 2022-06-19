import { BN } from '@heavy-duty/anchor';
import { AccountInfo } from '@solana/web3.js';
import {
	APPLICATION_ACCOUNT_NAME,
	BUDGET_ACCOUNT_NAME,
	COLLABORATOR_ACCOUNT_NAME,
	COLLECTION_ACCOUNT_NAME,
	COLLECTION_ATTRIBUTE_ACCOUNT_NAME,
	INSTRUCTION_ACCOUNT_ACCOUNT_NAME,
	INSTRUCTION_ACCOUNT_CONSTRAINT_ACCOUNT_NAME,
	INSTRUCTION_ACCOUNT_NAME,
	INSTRUCTION_ARGUMENT_ACCOUNT_NAME,
	INSTRUCTION_RELATION_ACCOUNT_NAME,
	USER_ACCOUNT_NAME,
	WORKSPACE_ACCOUNT_NAME,
} from './consts';

export interface CollectionAttributeDto {
	name: string;
	kind: number;
	modifier: number | null;
	size: number | null;
	max: number | null;
	maxLength: number | null;
}

export interface InstructionDto {
	name: string;
}

export interface InstructionBodyDto {
	body: string;
}

export interface InstructionAccountDto {
	name: string;
	kind: number;
	modifier: number | null;
	collection: string | null;
	space: number | null;
	payer: string | null;
	close: string | null;
	uncheckedExplanation: string | null;
	tokenAuthority: string | null;
	mint: string | null;
}

export interface InstructionAccountModel {
	name: string;
	kind: number;
	modifier: number | null;
	space: number | null;
	collection: string | null;
	close: string | null;
	payer: string | null;
	uncheckedExplanation: string | null;
	tokenAuthority: string | null;
	mint: string | null;
}

export interface InstructionAccountConstraintModel {
	name: string;
	body: string;
}

export interface InstructionArgumentDto {
	name: string;
	kind: number;
	modifier: number | null;
	size: number | null;
	max: number | null;
	maxLength: number | null;
}

export interface InstructionRelationDto {
	from: string;
	to: string;
}

export interface Budget {
	authority: string;
	workspace: string;
	bump: number;
	totalValueLocked: BN;
	totalDeposited: BN;
}

export interface Collaborator {
	authority: string;
	workspace: string;
	user: string;
	bump: number;
	isAdmin: boolean;
	status: {
		id: number;
		name: string;
	};
}

export interface CollaboratorDto {
	status: number;
}

export interface User {
	authority: string;
	userName: string;
	thumbnailUrl: string;
	bump: number;
}

export interface UserDto {
	name: string;
	userName: string;
	thumbnailUrl: string;
}

export interface Workspace {
	authority: string;
}

export interface WorkspaceDto {
	name: string;
}

export interface DepositToBudgetDto {
	amount: BN;
}

export interface WithdrawFromBudgetDto {
	amount: BN;
}

export interface Application {
	authority: string;
	workspace: string;
}

export interface ApplicationDto {
	name: string;
}

export interface Collection {
	authority: string;
	workspace: string;
	application: string;
}

export interface CollectionDto {
	name: string;
}

export interface CollectionAttribute {
	authority: string;
	workspace: string;
	application: string;
	collection: string;
	kind: {
		id: number;
		name: string;
		size: number;
	};
	modifier: {
		id: number;
		name: string;
		size: number;
	} | null;
	max: number | null;
	maxLength: number | null;
}

export interface Instruction {
	authority: string;
	workspace: string;
	application: string;
	body: string;
	chunks: { position: number; data: string }[];
}

export interface InstructionArgument {
	authority: string;
	workspace: string;
	application: string;
	instruction: string;
	kind: {
		id: number;
		name: string;
		size: number;
	};
	modifier: {
		id: number;
		name: string;
		size: number;
	} | null;
	max: number | null;
	maxLength: number | null;
}

export interface InstructionAccount {
	authority: string;
	workspace: string;
	application: string;
	instruction: string;
	space: number | null;
	kind: {
		id: number;
		name: string;
	};
	modifier: {
		id: number;
		name: string;
	} | null;
	collection: string | null;
	close: string | null;
	payer: string | null;
	derivation: string | null;
	uncheckedExplanation: string | null;
	tokenAuthority: string | null;
	mint: string | null;
}

export interface InstructionAccountCollection {
	collection: string | null;
}

export interface InstructionAccountDerivationPath {
	reference: string;
	path: string;
}

export interface InstructionAccountDerivation {
	bumpPath: InstructionAccountDerivationPath | null;
	seedPaths: string[];
}

export interface InstructionAccountConstraint {
	authority: string;
	workspace: string;
	application: string;
	instruction: string;
	account: string;
	body: string;
}

export interface InstructionAccountClose {
	close: string | null;
}

export interface InstructionAccountPayer {
	payer: string | null;
}

export interface InstructionRelation {
	authority: string;
	workspace: string;
	application: string;
	instruction: string;
}

export interface Account<T> {
	id: string;
	data: T;
	metadata: AccountInfo<Buffer>;
	createdAt: BN;
	updatedAt: BN;
}

export interface Document<T> extends Account<T> {
	name: string;
}

export interface Relation<T> extends Account<T> {
	from: string;
	to: string;
}

export type AccountName =
	| typeof USER_ACCOUNT_NAME
	| typeof COLLABORATOR_ACCOUNT_NAME
	| typeof BUDGET_ACCOUNT_NAME
	| typeof WORKSPACE_ACCOUNT_NAME
	| typeof APPLICATION_ACCOUNT_NAME
	| typeof COLLECTION_ACCOUNT_NAME
	| typeof COLLECTION_ATTRIBUTE_ACCOUNT_NAME
	| typeof INSTRUCTION_ACCOUNT_NAME
	| typeof INSTRUCTION_ARGUMENT_ACCOUNT_NAME
	| typeof INSTRUCTION_ACCOUNT_ACCOUNT_NAME
	| typeof INSTRUCTION_RELATION_ACCOUNT_NAME
	| typeof INSTRUCTION_ACCOUNT_CONSTRAINT_ACCOUNT_NAME;
