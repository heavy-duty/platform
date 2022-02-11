import { Program, ProgramError, Provider } from '@heavy-duty/anchor';
import { Keypair } from '@solana/web3.js';
import { assert } from 'chai';
import { Bulldozer, IDL } from '../target/types/bulldozer';
import { BULLDOZER_PROGRAM_ID } from './utils';

describe('collection', () => {
  const program = new Program<Bulldozer>(
    IDL,
    BULLDOZER_PROGRAM_ID,
    Provider.env()
  );
  const collection = Keypair.generate();
  const application = Keypair.generate();
  const workspace = Keypair.generate();
  const applicationName = 'my-app';
  const workspaceName = 'my-workspace';

  before(async () => {
    await program.methods
      .createWorkspace({ name: workspaceName })
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
      })
      .signers([workspace])
      .rpc();
    await program.methods
      .createApplication({ name: applicationName })
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
      })
      .signers([application])
      .rpc();
  });

  it('should create account', async () => {
    // arrange
    const collectionName = 'things';
    // act
    await program.methods
      .createCollection({ name: collectionName })
      .accounts({
        collection: collection.publicKey,
        application: application.publicKey,
        workspace: workspace.publicKey,
        authority: program.provider.wallet.publicKey,
      })
      .signers([collection])
      .rpc();
    // assert
    const account = await program.account.collection.fetch(
      collection.publicKey
    );
    const applicationAccount = await program.account.application.fetch(
      application.publicKey
    );
    assert.ok(account.authority.equals(program.provider.wallet.publicKey));
    assert.ok(account.workspace.equals(workspace.publicKey));
    assert.ok(account.application.equals(application.publicKey));
    assert.equal(account.name, collectionName);
    assert.equal(applicationAccount.quantityOfCollections, 1);
    assert.ok(account.createdAt.eq(account.updatedAt));
  });

  it('should update account', async () => {
    // arrange
    const collectionName = 'things2';
    // act
    await program.methods
      .updateCollection({ name: collectionName })
      .accounts({
        collection: collection.publicKey,
        authority: program.provider.wallet.publicKey,
      })
      .rpc();
    // assert
    const account = await program.account.collection.fetch(
      collection.publicKey
    );
    assert.equal(account.name, collectionName);
    assert.ok(account.createdAt.lte(account.updatedAt));
  });

  it('should delete account', async () => {
    // act
    await program.methods
      .deleteCollection()
      .accounts({
        collection: collection.publicKey,
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
      })
      .rpc();
    // assert
    const account = await program.account.collection.fetchNullable(
      collection.publicKey
    );
    const applicationAccount = await program.account.application.fetch(
      application.publicKey
    );
    assert.equal(account, null);
    assert.equal(applicationAccount.quantityOfCollections, 0);
  });

  it('should fail when deleting collection with attributes', async () => {
    // arrange
    const collectionName = 'sample';
    const collection = Keypair.generate();
    const attribute = Keypair.generate();
    const argumentsData = {
      name: 'attr1_name',
      kind: 0,
      modifier: null,
      size: null,
      max: null,
      maxLength: null,
    };
    let error: ProgramError | null = null;
    // act
    try {
      await program.methods
        .createCollection({ name: collectionName })
        .accounts({
          collection: collection.publicKey,
          application: application.publicKey,
          workspace: workspace.publicKey,
          authority: program.provider.wallet.publicKey,
        })
        .signers([collection])
        .rpc();
      await program.methods
        .createCollectionAttribute(argumentsData)
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          collection: collection.publicKey,
          attribute: attribute.publicKey,
        })
        .signers([attribute])
        .rpc();
      await program.methods
        .deleteCollection()
        .accounts({
          collection: collection.publicKey,
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
        })
        .rpc();
    } catch (err) {
      error = err as ProgramError;
    }
    // assert
    assert.equal(error?.code, 6013);
  });

  it('should fail when providing wrong "application" to delete', async () => {
    // arrange
    const newApplication = Keypair.generate();
    const newApplicationName = 'sample';
    const newCollection = Keypair.generate();
    const newCollectionName = 'sample';
    let error: ProgramError | null = null;
    // act
    try {
      await program.methods
        .createApplication({ name: newApplicationName })
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: newApplication.publicKey,
        })
        .signers([newApplication])
        .rpc();
      await program.methods
        .createCollection({ name: newCollectionName })
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: newApplication.publicKey,
          collection: newCollection.publicKey,
        })
        .signers([newCollection])
        .rpc();
      await program.methods
        .deleteCollection()
        .accounts({
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          collection: newCollection.publicKey,
        })
        .rpc();
    } catch (err) {
      error = err as ProgramError;
    }
    // assert
    assert.equal(error?.code, 6021);
  });
});
