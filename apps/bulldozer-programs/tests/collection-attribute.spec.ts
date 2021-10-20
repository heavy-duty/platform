import {
  Provider,
  setProvider,
  utils,
  workspace,
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
    const dto = {
      name: 'attr1_name',
      kind: 0,
      modifier: null,
      size: null,
      max: 40,
      maxLength: null,
    };
    // act
    await program.rpc.createCollectionAttribute(dto, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
        collection: collection.publicKey,
        attribute: attribute.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [attribute],
    });
    // assert
    const account = await program.account.collectionAttribute.fetch(
      attribute.publicKey
    );
    assert.ok(account.authority.equals(program.provider.wallet.publicKey));
    assert.equal(utils.bytes.utf8.decode(account.data.name), dto.name);
    assert.ok('number' in account.data.kind);
    assert.equal(account.data.kind.number.id, dto.kind);
    assert.equal(account.data.kind.number.size, dto.max);
    assert.equal(account.data.modifier, null);
    assert.ok(account.collection.equals(collection.publicKey));
    assert.ok(account.application.equals(application.publicKey));
  });

  it('should update account', async () => {
    // arrange
    const dto = {
      name: 'attr2_name',
      kind: 1,
      modifier: 0,
      size: 5,
      max: null,
      maxLength: 20,
    };
    // act
    await program.rpc.updateCollectionAttribute(dto, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
        collection: collection.publicKey,
        attribute: attribute.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });
    // assert
    const account = await program.account.collectionAttribute.fetch(
      attribute.publicKey
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
    const dto = {
      name: 'attr1_name',
      kind: 0,
      modifier: null,
      size: null,
      max: null,
      maxLength: null,
    };
    let error: ProgramError;
    // act
    try {
      await program.rpc.createCollectionAttribute(dto, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          collection: collection.publicKey,
          attribute: attribute.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [attribute],
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
      modifier: null,
      size: null,
      max: null,
      maxLength: null,
    };
    let error: ProgramError;
    // act
    try {
      await program.rpc.createCollectionAttribute(dto, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          collection: collection.publicKey,
          attribute: attribute.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [attribute],
      });
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 312);
  });
});
