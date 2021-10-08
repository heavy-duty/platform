import { Provider, setProvider, utils, workspace } from '@project-serum/anchor';
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
    const argumentName = 'name';
    const argumentKind = 1;
    const argumentSize = 32;
    const argumentModifier = 1;
    // act
    await program.rpc.createInstructionArgument(
      argumentName,
      argumentKind,
      argumentModifier,
      argumentSize,
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
    assert.ok('u16' in account.kind);
    assert.equal(account.kind.u16.id, argumentKind);
    assert.equal(account.kind.u16.size, 2);
    assert.ok('array' in account.modifier);
    assert.equal(account.modifier.array.id, argumentModifier);
    assert.equal(account.modifier.array.size, argumentSize);
    assert.ok(account.instruction.equals(instruction.publicKey));
    assert.ok(account.application.equals(application.publicKey));
  });

  it('should update account', async () => {
    // arrange
    const argumentName = 'new-name';
    const argumentKind = 2;
    const argumentSize = 5;
    const argumentModifier = 2;
    // act
    await program.rpc.updateInstructionArgument(
      argumentName,
      argumentKind,
      argumentModifier,
      argumentSize,
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
    assert.ok('u32' in account.kind);
    assert.equal(account.kind.u32.id, argumentKind);
    assert.equal(account.kind.u32.size, 4);
    assert.ok('vector' in account.modifier);
    assert.equal(account.modifier.vector.id, argumentModifier);
    assert.equal(account.modifier.vector.size, argumentSize);
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
});
