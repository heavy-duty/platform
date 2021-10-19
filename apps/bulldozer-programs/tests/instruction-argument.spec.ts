import {
  ProgramError,
  Provider,
  setProvider,
  utils,
  workspace,
} from '@project-serum/anchor';
import { Keypair, SystemProgram } from '@solana/web3.js';
import { assert } from 'chai';

describe('instruction argument', () => {
  setProvider(Provider.env());
  const program = workspace.Bulldozer;
  const instruction = Keypair.generate();
  const instructionArgument = Keypair.generate();
  const instructionName = 'create_document';
  const application = Keypair.generate();
  const applicationName = 'my-app';

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
  });

  it('should create account', async () => {
    // arrange
    const argumentName = 'attr1_name';
    const argumentKind = 0;
    const argumentModifier = null;
    const argumentSize = null;
    const argumentMax = 40;
    const argumentMaxLength = null;
    // act
    await program.rpc.createInstructionArgument(
      argumentName,
      argumentKind,
      argumentModifier,
      argumentSize,
      argumentMax,
      argumentMaxLength,
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          argument: instructionArgument.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [instructionArgument],
      }
    );
    // assert
    const account = await program.account.instructionArgument.fetch(
      instructionArgument.publicKey
    );
    assert.ok(account.authority.equals(program.provider.wallet.publicKey));
    assert.equal(utils.bytes.utf8.decode(account.name), argumentName);
    assert.ok('number' in account.kind);
    assert.equal(account.kind.number.id, argumentKind);
    assert.equal(account.kind.number.size, argumentMax);
    assert.equal(account.modifier, null);
    assert.ok(account.instruction.equals(instruction.publicKey));
    assert.ok(account.application.equals(application.publicKey));
  });

  it('should update account', async () => {
    // arrange
    const argumentName = 'attr1_name';
    const argumentKind = 1;
    const argumentModifier = 0;
    const argumentSize = 5;
    const argumentMax = null;
    const argumentMaxLength = 10;
    // act
    await program.rpc.updateInstructionArgument(
      argumentName,
      argumentKind,
      argumentModifier,
      argumentSize,
      argumentMax,
      argumentMaxLength,
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          argument: instructionArgument.publicKey,
        },
      }
    );
    // assert
    const account = await program.account.instructionArgument.fetch(
      instructionArgument.publicKey
    );
    assert.equal(utils.bytes.utf8.decode(account.name), argumentName);
    assert.ok('string' in account.kind);
    assert.equal(account.kind.string.id, argumentKind);
    assert.equal(account.kind.string.size, argumentMaxLength);
    assert.ok('array' in account.modifier);
    assert.equal(account.modifier.array.id, argumentModifier);
    assert.equal(account.modifier.array.size, argumentSize);
  });

  it('should delete account', async () => {
    // act
    await program.rpc.deleteInstructionArgument({
      accounts: {
        authority: program.provider.wallet.publicKey,
        argument: instructionArgument.publicKey,
      },
    });
    // assert
    const argumentAccount =
      await program.account.instructionArgument.fetchNullable(
        instructionArgument.publicKey
      );
    assert.equal(argumentAccount, null);
  });

  it('should fail when max is not provided with a number', async () => {
    // arrange
    const argumentName = 'attr1_name';
    const argumentKind = 0;
    const argumentModifier = 0;
    const argumentSize = null;
    const argumentMax = null;
    const argumentMaxLength = null;
    let error: ProgramError;
    // act
    try {
      await program.rpc.createInstructionArgument(
        argumentName,
        argumentKind,
        argumentModifier,
        argumentSize,
        argumentMax,
        argumentMaxLength,
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            argument: instructionArgument.publicKey,
            systemProgram: SystemProgram.programId,
          },
          signers: [instructionArgument],
        }
      );
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 311);
  });

  it('should fail when max length is not provided with a string', async () => {
    // arrange
    const argumentName = 'attr1_name';
    const argumentKind = 1;
    const argumentModifier = 0;
    const argumentSize = null;
    const argumentMax = null;
    const argumentMaxLength = null;
    let error: ProgramError;
    // act
    try {
      await program.rpc.createInstructionArgument(
        argumentName,
        argumentKind,
        argumentModifier,
        argumentSize,
        argumentMax,
        argumentMaxLength,
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            application: application.publicKey,
            instruction: instruction.publicKey,
            argument: instructionArgument.publicKey,
            systemProgram: SystemProgram.programId,
          },
          signers: [instructionArgument],
        }
      );
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 312);
  });
});
