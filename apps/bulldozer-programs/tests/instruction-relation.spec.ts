import {
  ProgramError,
  Provider,
  setProvider,
  workspace,
} from '@project-serum/anchor';
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { assert } from 'chai';

describe('instruction relation', () => {
  setProvider(Provider.env());
  const program = workspace.Bulldozer;
  const instruction = Keypair.generate();
  const instructionName = 'create_document';
  const application = Keypair.generate();
  const applicationName = 'my-app';
  const fromAccount = Keypair.generate();
  const fromAccountDto = {
    name: 'from',
    kind: 1,
    modifier: null,
    space: null,
  };
  const toAccount = Keypair.generate();
  const toAccountDto = {
    name: 'to',
    kind: 1,
    modifier: null,
    space: null,
  };
  let relationPublicKey: PublicKey, relationBump: number;

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
    await program.rpc.createInstructionAccount(fromAccountDto, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        account: fromAccount.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [fromAccount],
    });
    await program.rpc.createInstructionAccount(toAccountDto, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        account: toAccount.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [toAccount],
    });
    [relationPublicKey, relationBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from('instruction_relation', 'utf8'),
        fromAccount.publicKey.toBuffer(),
        toAccount.publicKey.toBuffer(),
      ],
      program.programId
    );
  });

  it('should create', async () => {
    // act
    await program.rpc.createInstructionRelation(relationBump, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        from: fromAccount.publicKey,
        to: toAccount.publicKey,
        relation: relationPublicKey,
        systemProgram: SystemProgram.programId,
      },
    });
    // assert
    const account = await program.account.instructionRelation.fetch(
      relationPublicKey
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
        relation: relationPublicKey,
      },
    });
    // assert
    const account = await program.account.instructionRelation.fetch(
      relationPublicKey
    );
    assert.ok(account.from.equals(toAccount.publicKey));
    assert.ok(account.to.equals(fromAccount.publicKey));
  });

  it('should delete', async () => {
    // act
    await program.rpc.deleteInstructionRelation({
      accounts: {
        authority: program.provider.wallet.publicKey,
        relation: relationPublicKey,
      },
    });
    // assert
    const account = await program.account.instructionRelation.fetchNullable(
      relationPublicKey
    );
    assert.equal(account, null);
  });

  it('should fail if from and to are equal', async () => {
    let error: ProgramError;
    let [relationPublicKey, relationBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from('instruction_relation', 'utf8'),
        fromAccount.publicKey.toBuffer(),
        fromAccount.publicKey.toBuffer(),
      ],
      program.programId
    );
    // act
    try {
      error = await program.rpc.createInstructionRelation(relationBump, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          from: fromAccount.publicKey,
          to: fromAccount.publicKey,
          relation: relationPublicKey,
          systemProgram: SystemProgram.programId,
        },
      });
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 143);
  });
});
