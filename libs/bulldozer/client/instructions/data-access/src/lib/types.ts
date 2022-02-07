import {
  Collection,
  Document,
  InstructionAccount,
  InstructionRelation,
  Relation,
} from '@heavy-duty/bulldozer-devkit';

export interface InstructionDocumentRelation
  extends Relation<InstructionRelation> {
  extras: {
    to: Document<InstructionAccount>;
  };
}

export interface InstructionDocument extends Document<InstructionAccount> {
  close: Document<InstructionAccount> | null;
  payer: Document<InstructionAccount> | null;
  collection: Document<Collection> | null;
  relations: InstructionDocumentRelation[];
}
