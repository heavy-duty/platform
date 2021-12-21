import {
  Idl,
  Program,
  Provider,
  setProvider,
  utils,
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
    assert.ok(account.authority.equals(program.provider.wallet.publicKey));
    assert.ok(account.workspace.equals(workspace.publicKey));
    assert.ok(account.application.equals(application.publicKey));
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
