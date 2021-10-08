import { Provider, setProvider, utils, workspace } from '@project-serum/anchor';
import { Keypair, SystemProgram } from '@solana/web3.js';
import { assert } from 'chai';

describe('collection', () => {
  setProvider(Provider.env());
  const program = workspace.Bulldozer;
  const collection = Keypair.generate();
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
  });

  it('should create account', async () => {
    // arrange
    const collectionName = 'things';
    // act
    await program.rpc.createCollection(collectionName, {
      accounts: {
        collection: collection.publicKey,
        application: application.publicKey,
        authority: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [collection],
    });
    // assert
    const account = await program.account.collection.fetch(
      collection.publicKey
    );
    assert.ok(account.authority.equals(program.provider.wallet.publicKey));
    assert.equal(utils.bytes.utf8.decode(account.name), collectionName);
  });

  it('should update account', async () => {
    // arrange
    const collectionName = 'things2';
    // act
    await program.rpc.updateCollection(collectionName, {
      accounts: {
        collection: collection.publicKey,
        authority: program.provider.wallet.publicKey,
      },
    });
    // assert
    const account = await program.account.collection.fetch(
      collection.publicKey
    );
    assert.equal(utils.bytes.utf8.decode(account.name), collectionName);
  });

  it('should delete account', async () => {
    // act
    await program.rpc.deleteCollection({
      accounts: {
        collection: collection.publicKey,
        authority: program.provider.wallet.publicKey,
      },
    });
    // assert
    const account = await program.account.collection.fetchNullable(
      collection.publicKey
    );
    assert.equal(account, null);
  });
});
