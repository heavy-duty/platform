import { Provider, setProvider, utils, workspace } from '@project-serum/anchor';
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
    const attributeModifier = 1;
    const attributeSize = 32;
    // act
    await program.rpc.createCollectionAttribute(
      attributeName,
      attributeKind,
      attributeModifier,
      attributeSize,
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
    assert.ok('u8' in account.kind);
    assert.equal(account.kind.u8.id, attributeKind);
    assert.equal(account.kind.u8.size, 1);
    assert.ok('array' in account.modifier);
    assert.equal(account.modifier.array.size, attributeSize);
    assert.equal(account.modifier.array.id, attributeModifier);
    assert.ok(account.collection.equals(collection.publicKey));
    assert.ok(account.application.equals(application.publicKey));
  });

  it('should update account', async () => {
    // arrange
    const attributeName = 'attr2_name';
    const attributeKind = 1;
    const attributeModifier = 2;
    const attributeSize = 5;
    // act
    await program.rpc.updateCollectionAttribute(
      attributeName,
      attributeKind,
      attributeModifier,
      attributeSize,
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
    assert.ok('u16' in account.kind);
    assert.equal(account.kind.u16.id, attributeKind);
    assert.equal(account.kind.u16.size, 2);
    assert.ok('vector' in account.modifier);
    assert.equal(account.modifier.vector.id, attributeModifier);
    assert.equal(account.modifier.vector.size, attributeSize);
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
});
