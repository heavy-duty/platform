import {
  Provider,
  setProvider,
  utils,
  workspace,
  BN,
  Program,
  ProgramError,
} from '@project-serum/anchor';
import { Keypair, SystemProgram } from '@solana/web3.js';
import { assert } from 'chai';

describe('collection attribute', () => {
  setProvider(Provider.env());
  const program = workspace.Bulldozer;
  const attribute = Keypair.generate();
  const collection = Keypair.generate();
  const collectionName = 'things';
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
    await program.rpc.createCollection(collectionName, {
      accounts: {
        collection: collection.publicKey,
        application: application.publicKey,
        authority: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [collection],
    });
  });

  it('should create account', async () => {
    // arrange
    const attributeName = 'attr1_name';
    const attributeKind = 0;
    const attributeModifier = null;
    const attributeSize = null;
    const attributeMax = 40;
    const attributeMaxLength = null;
    // act
    await program.rpc.createCollectionAttribute(
      attributeName,
      attributeKind,
      attributeModifier,
      attributeSize,
      attributeMax,
      attributeMaxLength,
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          collection: collection.publicKey,
          attribute: attribute.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [attribute],
      }
    );
    // assert
    const account = await program.account.collectionAttribute.fetch(
      attribute.publicKey
    );
    assert.ok(account.authority.equals(program.provider.wallet.publicKey));
    assert.equal(utils.bytes.utf8.decode(account.name), attributeName);
    assert.ok('number' in account.kind);
    assert.equal(account.kind.number.id, attributeKind);
    assert.equal(account.kind.number.size, attributeMax);
    assert.equal(account.modifier, null);
    assert.ok(account.collection.equals(collection.publicKey));
    assert.ok(account.application.equals(application.publicKey));
  });

  it('should update account', async () => {
    // arrange
    const attributeName = 'attr2_name';
    const attributeKind = 1;
    const attributeModifier = 0;
    const attributeSize = 5;
    const attributeMax = null;
    const attributeMaxLength = 20;
    // act
    await program.rpc.updateCollectionAttribute(
      attributeName,
      attributeKind,
      attributeModifier,
      attributeSize,
      attributeMax,
      attributeMaxLength,
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          collection: collection.publicKey,
          attribute: attribute.publicKey,
          systemProgram: SystemProgram.programId,
        },
      }
    );
    // assert
    const account = await program.account.collectionAttribute.fetch(
      attribute.publicKey
    );
    assert.equal(utils.bytes.utf8.decode(account.name), attributeName);
    assert.ok('string' in account.kind);
    assert.equal(account.kind.string.id, attributeKind);
    assert.equal(account.kind.string.size, attributeMaxLength);
    assert.ok('array' in account.modifier);
    assert.equal(account.modifier.array.id, attributeModifier);
    assert.equal(account.modifier.array.size, attributeSize);
  });

  it('should delete account', async () => {
    // act
    await program.rpc.deleteCollectionAttribute({
      accounts: {
        authority: program.provider.wallet.publicKey,
        attribute: attribute.publicKey,
      },
    });
    // assert
    const account = await program.account.collectionAttribute.fetchNullable(
      attribute.publicKey
    );
    assert.equal(account, null);
  });

  it('should fail when max is not provided with a number', async () => {
    // arrange
    const attributeName = 'attr1_name';
    const attributeKind = 0;
    const attributeModifier = 0;
    const attributeSize = null;
    const attributeMax = null;
    const attributeMaxLength = null;
    let error: ProgramError;
    // act
    try {
      await program.rpc.createCollectionAttribute(
        attributeName,
        attributeKind,
        attributeModifier,
        attributeSize,
        attributeMax,
        attributeMaxLength,
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            application: application.publicKey,
            collection: collection.publicKey,
            attribute: attribute.publicKey,
            systemProgram: SystemProgram.programId,
          },
          signers: [attribute],
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
    const attributeName = 'attr1_name';
    const attributeKind = 1;
    const attributeModifier = 0;
    const attributeSize = null;
    const attributeMax = null;
    const attributeMaxLength = null;
    let error: ProgramError;
    // act
    try {
      await program.rpc.createCollectionAttribute(
        attributeName,
        attributeKind,
        attributeModifier,
        attributeSize,
        attributeMax,
        attributeMaxLength,
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            application: application.publicKey,
            collection: collection.publicKey,
            attribute: attribute.publicKey,
            systemProgram: SystemProgram.programId,
          },
          signers: [attribute],
        }
      );
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 312);
  });
});
