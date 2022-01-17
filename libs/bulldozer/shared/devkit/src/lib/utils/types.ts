import { BN } from '@project-serum/anchor';
import { AccountInfo, PublicKey } from '@solana/web3.js';

export interface CollectionAttributeDto {
  name: string;
  kind: number;
  modifier: number | null;
  size: number | null;
  max: number | null;
  maxLength: number | null;
}

export interface InstructionAccountDto {
  name: string;
  kind: number;
  modifier: number | null;
  collection: string | null;
  space: number | null;
  payer: string | null;
  close: string | null;
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

export interface Workspace {
  authority: string;
}

export interface Application {
  authority: string;
  workspace: string;
}

export interface Collection {
  authority: string;
  workspace: string;
  application: string;
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
  kind: {
    id: number;
    name: string;
    collection: string | null;
  };
  modifier: {
    id: number;
    name: string;
    space: number | null;
    payer: string | null;
    close: string | null;
  } | null;
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

export const AUTHORITY_FIELD_LABEL = 'authority';
export const WORKSPACE_FIELD_LABEL = 'workspace';
export const APPLICATION_FIELD_LABEL = 'application';
export const COLLECTION_FIELD_LABEL = 'collection';
export const INSTRUCTION_FIELD_LABEL = 'instruction';

export type FieldLabel =
  | typeof AUTHORITY_FIELD_LABEL
  | typeof WORKSPACE_FIELD_LABEL
  | typeof APPLICATION_FIELD_LABEL
  | typeof INSTRUCTION_FIELD_LABEL
  | typeof COLLECTION_FIELD_LABEL;

export type Filters = Partial<{
  [key in
    | typeof AUTHORITY_FIELD_LABEL
    | typeof WORKSPACE_FIELD_LABEL
    | typeof APPLICATION_FIELD_LABEL
    | typeof COLLECTION_FIELD_LABEL
    | typeof INSTRUCTION_FIELD_LABEL]: string;
}>;

export type WorkspaceFilters = Partial<{
  [key in typeof AUTHORITY_FIELD_LABEL]: string;
}>;
export type ApplicationFilters = Partial<{
  [key in typeof AUTHORITY_FIELD_LABEL | typeof WORKSPACE_FIELD_LABEL]: string;
}>;
export type CollectionFilters = Partial<{
  [key in
    | typeof AUTHORITY_FIELD_LABEL
    | typeof WORKSPACE_FIELD_LABEL
    | typeof APPLICATION_FIELD_LABEL]: string;
}>;
export type CollectionAttributeFilters = Partial<{
  [key in
    | typeof AUTHORITY_FIELD_LABEL
    | typeof WORKSPACE_FIELD_LABEL
    | typeof APPLICATION_FIELD_LABEL
    | typeof COLLECTION_FIELD_LABEL]: string;
}>;
export type InstructionFilters = Partial<{
  [key in
    | typeof AUTHORITY_FIELD_LABEL
    | typeof WORKSPACE_FIELD_LABEL
    | typeof APPLICATION_FIELD_LABEL]: string;
}>;
export type InstructionAccountFilters = Partial<{
  [key in
    | typeof AUTHORITY_FIELD_LABEL
    | typeof WORKSPACE_FIELD_LABEL
    | typeof APPLICATION_FIELD_LABEL
    | typeof INSTRUCTION_FIELD_LABEL]: string;
}>;
export type InstructionArgumentFilters = Partial<{
  [key in
    | typeof AUTHORITY_FIELD_LABEL
    | typeof WORKSPACE_FIELD_LABEL
    | typeof APPLICATION_FIELD_LABEL
    | typeof INSTRUCTION_FIELD_LABEL]: string;
}>;
export type InstructionRelationFilters = Partial<{
  [key in
    | typeof AUTHORITY_FIELD_LABEL
    | typeof WORKSPACE_FIELD_LABEL
    | typeof APPLICATION_FIELD_LABEL
    | typeof INSTRUCTION_FIELD_LABEL]: string;
}>;

export type AccountFactory<ResultAccount> = (
  publicKey: PublicKey,
  accountInfo: AccountInfo<Buffer>
) => ResultAccount;
