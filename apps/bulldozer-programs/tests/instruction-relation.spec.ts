import {
  ProgramError,
  Provider,
  setProvider,
  utils,
  workspace,
} from '@project-serum/anchor';
import { Keypair, SystemProgram } from '@solana/web3.js';
import { assert } from 'chai';

describe('instruction relation', () => {
  setProvider(Provider.env());
  const program = workspace.Bulldozer;
  const instruction = Keypair.generate();
  const instructionName = 'create_document';
  const application = Keypair.generate();
  const applicationName = 'my-app';
  const fromAccount = Keypair.generate();
  const fromAccountName = 'from';
  const fromAccountKind = 2;
  const fromAccountModifier = 0;
  const fromAccountSpace = null;
  const fromAccountProgram = null;
  const toAccount = Keypair.generate();
  const toAccountName = 'to';
  const toAccountKind = 2;
  const toAccountModifier = 0;
  const toAccountSpace = null;
  const toAccountProgram = null;
  const relationAccount = Keypair.generate();

  before(async () => {
    await program.rpc.createApplication(applicationName, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [application],
    });
    await program.rpc.createInstruction(instructionName, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [instruction],
    });
    await program.rpc.createInstructionAccount(
      fromAccountName,
      fromAccountKind,
      fromAccountModifier,
      fromAccountSpace,
      fromAccountProgram,
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          account: fromAccount.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [fromAccount],
      }
    );
    await program.rpc.createInstructionAccount(
      toAccountName,
      toAccountKind,
      toAccountModifier,
      toAccountSpace,
      toAccountProgram,
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          account: toAccount.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [toAccount],
      }
    );
  });

  it('should create', async () => {
    // act
    await program.rpc.createInstructionRelation({
      accounts: {
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        from: fromAccount.publicKey,
        to: toAccount.publicKey,
        relation: relationAccount.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [relationAccount],
    });
    // assert
    const account = await program.account.instructionRelation.fetch(
      relationAccount.publicKey
    );
    assert.ok(account.authority.equals(program.provider.wallet.publicKey));
    assert.ok(account.instruction.equals(instruction.publicKey));
    assert.ok(account.application.equals(application.publicKey));
    assert.ok(account.from.equals(fromAccount.publicKey));
    assert.ok(account.to.equals(toAccount.publicKey));
  });

  it('should update', async () => {
    // act
    await program.rpc.updateInstructionRelation({
      accounts: {
        authority: program.provider.wallet.publicKey,
        from: toAccount.publicKey,
        to: fromAccount.publicKey,
        relation: relationAccount.publicKey,
      },
    });
    // assert
    const account = await program.account.instructionRelation.fetch(
      relationAccount.publicKey
    );
    assert.ok(account.from.equals(toAccount.publicKey));
    assert.ok(account.to.equals(fromAccount.publicKey));
  });

  it('should delete', async () => {
    // act
    await program.rpc.deleteInstructionRelation({
      accounts: {
        authority: program.provider.wallet.publicKey,
        relation: relationAccount.publicKey,
      },
    });
    // assert
    const account = await program.account.instructionRelation.fetchNullable(
      relationAccount.publicKey
    );
    assert.equal(account, null);
  });
});
