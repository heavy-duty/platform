import { utils } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

import {
  InstructionAccount,
  Application,
  Collection,
  CollectionAttribute,
  Instruction,
  InstructionArgument,
  InstructionRelation,
} from '@heavy-duty/bulldozer/application/utils/types';

interface RawApplication {
  authority: PublicKey;
  name: Uint8Array;
}

export const ApplicationParser = (
  publicKey: PublicKey,
  account: RawApplication
): Application => {
  return {
    id: publicKey.toBase58(),
    data: {
      name: utils.bytes.utf8.decode(account.name),
      authority: account.authority.toBase58(),
    },
  };
};

export const ApplicationParser2 = (
  publicKey: PublicKey,
  account: RawApplication
): Application => {
  return {
    id: publicKey.toBase58(),
    data: {
      name: utils.bytes.utf8.decode(account.name),
      authority: account.authority.toBase58(),
    },
  };
};

interface RawCollection {
  authority: PublicKey;
  application: PublicKey;
  name: Uint8Array;
}

export const CollectionParser = (
  publicKey: PublicKey,
  account: RawCollection
): Collection => {
  return {
    id: publicKey.toBase58(),
    data: {
      application: account.application.toBase58(),
      authority: account.authority.toBase58(),
      name: utils.bytes.utf8.decode(account.name),
    },
  };
};

interface RawCollectionAttribute {
  authority: PublicKey;
  application: PublicKey;
  collection: PublicKey;
  name: Uint8Array;
  kind: { [key: string]: { id: number; name: string; size: number } };
  modifier: { [key: string]: { id: number; name: string; size: number } };
}

export const CollectionAttributeParser = (
  publicKey: PublicKey,
  account: RawCollectionAttribute
): CollectionAttribute => {
  return {
    id: publicKey.toBase58(),
    data: {
      authority: account.authority.toBase58(),
      application: account.application.toBase58(),
      collection: account.collection.toBase58(),
      name: utils.bytes.utf8.decode(account.name),
      kind: {
        id: Object.values(account.kind)[0].id,
        name: Object.keys(account.kind)[0],
        size: Object.values(account.kind)[0].size,
      },
      modifier: {
        id: Object.values(account.modifier)[0].id,
        name: Object.keys(account.modifier)[0],
        size: Object.values(account.modifier)[0].size,
      },
    },
  };
};

interface RawInstruction {
  authority: PublicKey;
  application: PublicKey;
  name: Uint8Array;
  body: Uint8Array;
}

export const InstructionParser = (
  publicKey: PublicKey,
  account: RawInstruction
): Instruction => {
  return {
    id: publicKey.toBase58(),
    data: {
      authority: account.authority.toBase58(),
      application: account.application.toBase58(),
      name: utils.bytes.utf8.decode(account.name),
      body: utils.bytes.utf8.decode(account.body),
    },
  };
};

interface RawInstructionArgument {
  authority: PublicKey;
  application: PublicKey;
  instruction: PublicKey;
  name: Uint8Array;
  kind: { [key: string]: { id: number; name: string; size: number } };
  modifier: { [key: string]: { id: number; name: string; size: number } };
}

export const InstructionArgumentParser = (
  publicKey: PublicKey,
  account: RawInstructionArgument
): InstructionArgument => {
  return {
    id: publicKey.toBase58(),
    data: {
      authority: account.authority.toBase58(),
      application: account.application.toBase58(),
      instruction: account.instruction.toBase58(),
      name: utils.bytes.utf8.decode(account.name),
      kind: {
        id: Object.values(account.kind)[0].id,
        name: Object.keys(account.kind)[0],
        size: Object.values(account.kind)[0].size,
      },
      modifier: {
        id: Object.values(account.modifier)[0].id,
        name: Object.keys(account.modifier)[0],
        size: Object.values(account.modifier)[0].size,
      },
    },
  };
};

interface RawInstructionAccount {
  authority: PublicKey;
  application: PublicKey;
  instruction: PublicKey;
  name: Uint8Array;
  kind: { [key: string]: { id: number; name: string } };
  modifier: { [key: string]: { id: number; name: string } };
  collection: PublicKey | null;
  space: number | null;
  payer: PublicKey | null;
  close: PublicKey | null;
}

export const InstructionAccountParser = (
  publicKey: PublicKey,
  account: RawInstructionAccount
): InstructionAccount => {
  return {
    id: publicKey.toBase58(),
    data: {
      authority: account.authority.toBase58(),
      application: account.application.toBase58(),
      instruction: account.instruction.toBase58(),
      name: utils.bytes.utf8.decode(account.name),
      kind: {
        id: Object.values(account.kind)[0].id,
        name: Object.keys(account.kind)[0],
      },
      modifier: {
        id: Object.values(account.modifier)[0].id,
        name: Object.keys(account.modifier)[0],
      },
      collection: account.collection && account.collection.toBase58(),
      close: account.close && account.close.toBase58(),
      payer: account.payer && account.payer.toBase58(),
      space: account.space,
    },
  };
};

interface RawInstructionRelation {
  authority: PublicKey;
  application: PublicKey;
  instruction: PublicKey;
  from: PublicKey;
  to: PublicKey;
}

export const InstructionRelationParser = (
  publicKey: PublicKey,
  account: RawInstructionRelation
): InstructionRelation => {
  return {
    id: publicKey.toBase58(),
    data: {
      authority: account.authority.toBase58(),
      application: account.application.toBase58(),
      instruction: account.instruction.toBase58(),
      from: account.from.toBase58(),
      to: account.to.toBase58(),
    },
  };
};
