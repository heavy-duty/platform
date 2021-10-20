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
    const dto = {
      name: 'attr1_name',
      kind: 0,
      modifier: null,
      size: null,
      max: 40,
      maxLength: null,
    };
    // act
    await program.rpc.createInstructionArgument(dto, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        argument: instructionArgument.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [instructionArgument],
    });
    // assert
    const account = await program.account.instructionArgument.fetch(
      instructionArgument.publicKey
    );
    assert.ok(account.authority.equals(program.provider.wallet.publicKey));
    assert.ok(account.application.equals(application.publicKey));
    assert.ok(account.instruction.equals(instruction.publicKey));
    assert.equal(utils.bytes.utf8.decode(account.data.name), dto.name);
    assert.ok('number' in account.data.kind);
    assert.equal(account.data.kind.number.id, dto.kind);
    assert.equal(account.data.kind.number.size, dto.max);
    assert.equal(account.data.modifier, null);
  });

  it('should update account', async () => {
    // arrange
    const dto = {
      name: 'attr1_name',
      kind: 1,
      modifier: 0,
      size: 5,
      max: null,
      maxLength: 10,
    };
    // act
    await program.rpc.updateInstructionArgument(dto, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        argument: instructionArgument.publicKey,
      },
    });
    // assert
    const account = await program.account.instructionArgument.fetch(
      instructionArgument.publicKey
    );
    assert.equal(utils.bytes.utf8.decode(account.data.name), dto.name);
    assert.ok('string' in account.data.kind);
    assert.equal(account.data.kind.string.id, dto.kind);
    assert.equal(account.data.kind.string.size, dto.maxLength);
    assert.ok('array' in account.data.modifier);
    assert.equal(account.data.modifier.array.id, dto.modifier);
    assert.equal(account.data.modifier.array.size, dto.size);
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
    const dto = {
      name: 'attr1_name',
      kind: 0,
      modifier: 0,
      size: null,
      max: null,
      maxLength: null,
    };
    let error: ProgramError;
    // act
    try {
      await program.rpc.createInstructionArgument(dto, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          argument: instructionArgument.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [instructionArgument],
      });
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 311);
  });

  it('should fail when max length is not provided with a string', async () => {
    // arrange
    const dto = {
      name: 'attr1_name',
      kind: 1,
      modifier: 0,
      size: null,
      max: null,
      maxLength: null,
    };
    let error: ProgramError;
    // act
    try {
      await program.rpc.createInstructionArgument(dto, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          argument: instructionArgument.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [instructionArgument],
      });
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 312);
  });
});
