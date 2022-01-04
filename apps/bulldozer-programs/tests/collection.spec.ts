import {
  Idl,
  Program,
  ProgramError,
  Provider,
  setProvider,
} from '@project-serum/anchor';
import { Keypair, SystemProgram } from '@solana/web3.js';
import { assert } from 'chai';
import * as bulldozerIdl from '../target/idl/bulldozer.json';
import { BULLDOZER_PROGRAM_ID } from './utils';

describe('collection', () => {
  const program = new Program(bulldozerIdl as Idl, BULLDOZER_PROGRAM_ID);
  setProvider(Provider.env());
  const collection = Keypair.generate();
  const application = Keypair.generate();
  const workspace = Keypair.generate();
  const applicationName = 'my-app';
  const workspaceName = 'my-workspace';

  before(async () => {
    await program.rpc.createWorkspace(workspaceName, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [workspace],
    });
    await program.rpc.createApplication(applicationName, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
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
        workspace: workspace.publicKey,
        authority: program.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [collection],
    });
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
    assert.equal(account.name, collectionName);
  });

  it('should delete account', async () => {
    // act
    await program.rpc.deleteCollection({
      accounts: {
        collection: collection.publicKey,
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
      },
    });
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
      await program.rpc.createCollection(collectionName, {
        accounts: {
          collection: collection.publicKey,
          application: application.publicKey,
          workspace: workspace.publicKey,
          authority: program.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [collection],
      });
      await program.rpc.createCollectionAttribute(dto, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          collection: collection.publicKey,
          attribute: attribute.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [attribute],
      });
      await program.rpc.deleteCollection({
        accounts: {
          collection: collection.publicKey,
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
        },
      });
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6013);
  });

  it('should fail when providing wrong "application" to delete', async () => {
    // arrange
    const newApplication = Keypair.generate();
    const newApplicationName = 'sample';
    const newCollection = Keypair.generate();
    const newCollectionName = 'sample';
    let error: ProgramError;
    // act
    try {
      await program.rpc.createApplication(newApplicationName, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: newApplication.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [newApplication],
      });
      await program.rpc.createCollection(newCollectionName, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: newApplication.publicKey,
          collection: newCollection.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [newCollection],
      });
      await program.rpc.deleteCollection({
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          collection: newCollection.publicKey,
        },
      });
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6023);
  });
});
