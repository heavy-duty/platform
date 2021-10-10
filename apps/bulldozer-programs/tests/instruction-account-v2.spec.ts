import { Provider, setProvider, utils, workspace } from '@project-serum/anchor';
import { Keypair, SystemProgram } from '@solana/web3.js';
import { assert } from 'chai';

describe('instruction account', () => {
  setProvider(Provider.env());
  const program = workspace.Bulldozer;
  const instruction = Keypair.generate();
  const instructionAccount = Keypair.generate();
  const instructionName = 'create_document';
  const collection = Keypair.generate();
  const collectionName = 'things';
  const application = Keypair.generate();
  const applicationName = 'my-app';
  const anotherCollection = Keypair.generate();
  const anotherCollectionName = 'another-things';

  before(async () => {
    await program.rpc.createApplication(applicationName, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [application],
    });
    await program.rpc.createCollection(collectionName, {
      accounts: {
        collection: collection.publicKey,
        application: application.publicKey,
        authority: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [collection],
    });
    await program.rpc.createCollection(anotherCollectionName, {
      accounts: {
        collection: anotherCollection.publicKey,
        application: application.publicKey,
        authority: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [anotherCollection],
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

  it('should create basic account with no modifier', async () => {
    // arrange
    const instructionAccountName = 'data';
    const instructionAccountKind = 0;
    const instructionAccountModifier = 0;
    // act
    await program.rpc.createInstructionAccount(
      instructionAccountName,
      instructionAccountKind,
      instructionAccountModifier,
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          account: instructionAccount.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [instructionAccount],
      }
    );
    // assert
    const account = await program.account.instructionAccount.fetch(
      instructionAccount.publicKey
    );
    assert.ok(account.authority.equals(program.provider.wallet.publicKey));
    assert.equal(utils.bytes.utf8.decode(account.name), instructionAccountName);
    assert.ok('basic' in account.kind);
    assert.equal(account.kind.basic.id, instructionAccountKind);
    assert.ok('none' in account.modifier);
    assert.equal(account.modifier.none.id, instructionAccountModifier);
    assert.ok(account.instruction.equals(instruction.publicKey));
    assert.ok(account.application.equals(application.publicKey));
  });
});
