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
  space: number | null;
}

export interface InstructionAccountExtras {
  collection: string | null;
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
