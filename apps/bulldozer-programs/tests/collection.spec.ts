import { AnchorError, AnchorProvider, Program } from '@heavy-duty/anchor';
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import { assert } from 'chai';
import { Bulldozer, IDL } from '../target/types/bulldozer';
import { BULLDOZER_PROGRAM_ID } from './utils';

describe('collection', () => {
  const provider = AnchorProvider.env();
  const program = new Program<Bulldozer>(IDL, BULLDOZER_PROGRAM_ID, provider);
  const collection = Keypair.generate();
  const application = Keypair.generate();
  const workspace = Keypair.generate();
  const applicationName = 'my-app';
  const workspaceName = 'my-workspace';
  let budgetPublicKey: PublicKey;
  let applicationStatsPublicKey: PublicKey;
  const userUserName = 'user-name-1';
  const userName = 'User Name 1';
  const userThumbnailUrl = 'https://img/1.com';
  const newUserUserName = 'user-name-2';
  const newUserName = 'User Name 2';
  const newUserThumbnailUrl = 'https://img/2.com';

  before(async () => {
    [budgetPublicKey] = await PublicKey.findProgramAddress(
      [Buffer.from('budget', 'utf8'), workspace.publicKey.toBuffer()],
      program.programId
    );
    [applicationStatsPublicKey] = await PublicKey.findProgramAddress(
      [
        Buffer.from('application_stats', 'utf8'),
        application.publicKey.toBuffer(),
      ],
      program.programId
    );

    try {
      await program.methods
        .createUser({
          name: userName,
          thumbnailUrl: userThumbnailUrl,
          userName: userUserName,
        })
        .accounts({
          authority: provider.wallet.publicKey,
        })
        .rpc();
    } catch (error) {}

    await program.methods
      .createWorkspace({ name: workspaceName })
      .accounts({
        authority: provider.wallet.publicKey,
        workspace: workspace.publicKey,
      })
      .signers([workspace])
      .postInstructions([
        SystemProgram.transfer({
          fromPubkey: provider.wallet.publicKey,
          toPubkey: budgetPublicKey,
          lamports: LAMPORTS_PER_SOL,
        }),
      ])
      .rpc();
    await program.methods
      .createApplication({ name: applicationName })
      .accounts({
        authority: provider.wallet.publicKey,
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
        authority: provider.wallet.publicKey,
      })
      .signers([collection])
      .rpc();
    // assert
    const account = await program.account.collection.fetch(
      collection.publicKey
    );
    const applicationStatsAccount =
      await program.account.applicationStats.fetch(applicationStatsPublicKey);
    assert.ok(account.authority.equals(provider.wallet.publicKey));
    assert.ok(account.workspace.equals(workspace.publicKey));
    assert.ok(account.application.equals(application.publicKey));
    assert.equal(account.name, collectionName);
    assert.equal(applicationStatsAccount.quantityOfCollections, 1);
    assert.ok(account.createdAt.eq(account.updatedAt));
  });

  it('should update account', async () => {
    // arrange
    const collectionName = 'things2';
    // act
    await program.methods
      .updateCollection({ name: collectionName })
      .accounts({
        authority: provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        collection: collection.publicKey,
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
        authority: provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        collection: collection.publicKey,
      })
      .rpc();
    // assert
    const account = await program.account.collection.fetchNullable(
      collection.publicKey
    );
    const applicationStatsAccount =
      await program.account.applicationStats.fetch(applicationStatsPublicKey);
    assert.equal(account, null);
    assert.equal(applicationStatsAccount.quantityOfCollections, 0);
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
    let error: AnchorError | null = null;
    // act
    try {
      await program.methods
        .createCollection({ name: collectionName })
        .accounts({
          authority: provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          collection: collection.publicKey,
        })
        .signers([collection])
        .rpc();
      await program.methods
        .createCollectionAttribute(argumentsData)
        .accounts({
          authority: provider.wallet.publicKey,
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
          authority: provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          collection: collection.publicKey,
        })
        .rpc();
    } catch (err) {
      error = err as AnchorError;
    }
    // assert
    assert.equal(error?.error.errorCode.number, 6013);
  });

  it('should fail when providing wrong "application" to delete', async () => {
    // arrange
    const newApplication = Keypair.generate();
    const newApplicationName = 'sample';
    const newCollection = Keypair.generate();
    const newCollectionName = 'sample';
    let error: AnchorError | null = null;
    // act
    try {
      await program.methods
        .createApplication({ name: newApplicationName })
        .accounts({
          authority: provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: newApplication.publicKey,
        })
        .signers([newApplication])
        .rpc();
      await program.methods
        .createCollection({ name: newCollectionName })
        .accounts({
          authority: provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: newApplication.publicKey,
          collection: newCollection.publicKey,
        })
        .signers([newCollection])
        .rpc();
      await program.methods
        .deleteCollection()
        .accounts({
          authority: provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          collection: newCollection.publicKey,
        })
        .rpc();
    } catch (err) {
      error = err as AnchorError;
    }
    // assert
    assert.equal(error?.error.errorCode.number, 6035);
  });

  it('should fail when workspace has insufficient funds', async () => {
    // arrange
    const newWorkspace = Keypair.generate();
    const newWorkspaceName = 'sample';
    const newApplication = Keypair.generate();
    const newApplicationName = 'sample';
    const newCollection = Keypair.generate();
    const newCollectionName = 'sample';
    const [newBudgetPublicKey] = await PublicKey.findProgramAddress(
      [Buffer.from('budget', 'utf8'), newWorkspace.publicKey.toBuffer()],
      program.programId
    );
    let error: AnchorError | null = null;
    // act
    await program.methods
      .createWorkspace({ name: newWorkspaceName })
      .accounts({
        authority: provider.wallet.publicKey,
        workspace: newWorkspace.publicKey,
      })
      .signers([newWorkspace])
      .postInstructions([
        SystemProgram.transfer({
          fromPubkey: provider.wallet.publicKey,
          toPubkey: newBudgetPublicKey,
          lamports:
            (await program.provider.connection.getMinimumBalanceForRentExemption(
              125 // application account size
            )) +
            (await program.provider.connection.getMinimumBalanceForRentExemption(
              10 // application stats account size
            )),
        }),
      ])
      .rpc();
    await program.methods
      .createApplication({ name: newApplicationName })
      .accounts({
        authority: provider.wallet.publicKey,
        workspace: newWorkspace.publicKey,
        application: newApplication.publicKey,
      })
      .signers([newApplication])
      .rpc();
    try {
      await program.methods
        .createCollection({ name: newCollectionName })
        .accounts({
          authority: provider.wallet.publicKey,
          workspace: newWorkspace.publicKey,
          application: newApplication.publicKey,
          collection: newCollection.publicKey,
        })
        .signers([newCollection])
        .rpc();
    } catch (err) {
      error = err as AnchorError;
    }
    // assert
    assert.equal(error?.error.errorCode.number, 6027);
  });

  it('should fail when user is not a collaborator', async () => {
    // arrange
    const newCollection = Keypair.generate();
    const newCollectionName = 'sample';
    const newUser = Keypair.generate();
    let error: AnchorError | null = null;
    // act
    try {
      await program.methods
        .createCollection({ name: newCollectionName })
        .accounts({
          authority: newUser.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          collection: newCollection.publicKey,
        })
        .signers([newUser, newCollection])
        .preInstructions([
          SystemProgram.transfer({
            fromPubkey: provider.wallet.publicKey,
            toPubkey: newUser.publicKey,
            lamports: LAMPORTS_PER_SOL,
          }),
        ])
        .rpc();
    } catch (err) {
      error = err as AnchorError;
    }
    // assert
    assert.equal(error?.error.errorCode.number, 3012);
  });

  it('should fail when user is not an approved collaborator', async () => {
    // arrange
    const newCollection = Keypair.generate();
    const newCollectionName = 'sample';
    const newUser = Keypair.generate();
    let error: AnchorError | null = null;
    // act
    const [newUserPublicKey] = await PublicKey.findProgramAddress(
      [Buffer.from('user', 'utf8'), newUser.publicKey.toBuffer()],
      program.programId
    );
    await program.methods
      .createUser({
        name: newUserName,
        thumbnailUrl: newUserThumbnailUrl,
        userName: newUserUserName,
      })
      .accounts({
        authority: newUser.publicKey,
      })
      .signers([newUser])
      .preInstructions([
        SystemProgram.transfer({
          fromPubkey: provider.wallet.publicKey,
          toPubkey: newUser.publicKey,
          lamports: LAMPORTS_PER_SOL,
        }),
      ])
      .rpc();
    await program.methods
      .requestCollaboratorStatus()
      .accounts({
        authority: newUser.publicKey,
        user: newUserPublicKey,
        workspace: workspace.publicKey,
      })
      .signers([newUser])
      .rpc();

    try {
      await program.methods
        .createCollection({ name: newCollectionName })
        .accounts({
          authority: newUser.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          collection: newCollection.publicKey,
        })
        .signers([newUser, newCollection])
        .rpc();
    } catch (err) {
      error = err as AnchorError;
    }
    // assert
    assert.equal(error?.error.errorCode.number, 6029);
  });
});
