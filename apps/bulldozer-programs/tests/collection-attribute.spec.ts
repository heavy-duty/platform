import { AnchorError, AnchorProvider, Program } from '@heavy-duty/anchor';
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import { assert } from 'chai';
import { Bulldozer, IDL } from '../target/types/bulldozer';
import { BULLDOZER_PROGRAM_ID, decodeAttributeEnum } from './utils';

describe('collection attribute', () => {
  const provider = AnchorProvider.env();
  const program = new Program<Bulldozer>(IDL, BULLDOZER_PROGRAM_ID, provider);
  const attribute = Keypair.generate();
  const collection = Keypair.generate();
  const application = Keypair.generate();
  const workspace = Keypair.generate();
  const applicationName = 'my-app';
  const workspaceName = 'my-workspace';
  const collectionName = 'my-collection';
  let collectionStatsPublicKey: PublicKey;
  let budgetPublicKey: PublicKey;
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
    [collectionStatsPublicKey] = await PublicKey.findProgramAddress(
      [
        Buffer.from('collection_stats', 'utf8'),
        collection.publicKey.toBuffer(),
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

    await program.methods
      .createCollection({ name: collectionName })
      .accounts({
        collection: collection.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        authority: provider.wallet.publicKey,
      })
      .signers([collection])
      .rpc();
  });

  it('should create account', async () => {
    // arrange
    const attributesData = {
      name: 'attr1_name',
      kind: 0,
      modifier: null,
      size: null,
      max: null,
      maxLength: null,
    };
    // act
    await program.methods
      .createCollectionAttribute(attributesData)
      .accounts({
        authority: provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        collection: collection.publicKey,
        attribute: attribute.publicKey,
      })
      .signers([attribute])
      .rpc();
    // assert
    const collectionAttributeAccount =
      await program.account.collectionAttribute.fetch(attribute.publicKey);
    const collectionStatsAccount = await program.account.collectionStats.fetch(
      collectionStatsPublicKey
    );
    const decodedKind = decodeAttributeEnum(
      collectionAttributeAccount.kind as any
    );
    assert.ok(
      collectionAttributeAccount.authority.equals(provider.wallet.publicKey)
    );
    assert.equal(collectionAttributeAccount.name, attributesData.name);
    assert.equal(decodedKind.id, attributesData.kind);
    assert.equal(collectionAttributeAccount.modifier, null);
    assert.ok(
      collectionAttributeAccount.collection?.equals(collection.publicKey)
    );
    assert.ok(
      collectionAttributeAccount.application.equals(application.publicKey)
    );
    assert.ok(collectionAttributeAccount.workspace.equals(workspace.publicKey));
    assert.equal(collectionStatsAccount.quantityOfAttributes, 1);
    assert.ok(
      collectionAttributeAccount.createdAt.eq(
        collectionAttributeAccount.updatedAt
      )
    );
  });

  it('should update account', async () => {
    // arrange
    const attributesData = {
      name: 'attr2_name',
      kind: 1,
      modifier: 0,
      size: 5,
      max: 20,
      maxLength: null,
    };
    // act
    await program.methods
      .updateCollectionAttribute(attributesData)
      .accounts({
        authority: provider.wallet.publicKey,
        workspace: workspace.publicKey,
        collection: collection.publicKey,
        attribute: attribute.publicKey,
      })
      .rpc();
    // assert
    const account = await program.account.collectionAttribute.fetch(
      attribute.publicKey
    );
    const decodedKind = decodeAttributeEnum(account.kind as any);
    const decodedModifier = decodeAttributeEnum(account.modifier as any);
    assert.equal(account.name, attributesData.name);
    assert.equal(decodedKind.id, attributesData.kind);
    assert.equal(decodedKind.name, 'number');
    assert.equal(decodedKind.size, attributesData.max);
    assert.equal(decodedModifier.id, attributesData.modifier);
    assert.equal(decodedModifier.name, 'array');
    assert.equal(decodedModifier.size, attributesData.size);
    assert.ok(account.createdAt.lte(account.updatedAt));
  });

  it('should delete account', async () => {
    // act
    await program.methods
      .deleteCollectionAttribute()
      .accounts({
        authority: provider.wallet.publicKey,
        workspace: workspace.publicKey,
        collection: collection.publicKey,
        attribute: attribute.publicKey,
      })
      .rpc();
    // assert
    const collectionAttributeAccount =
      await program.account.collectionAttribute.fetchNullable(
        attribute.publicKey
      );
    const collectionStatsAccount = await program.account.collectionStats.fetch(
      collectionStatsPublicKey
    );
    assert.equal(collectionAttributeAccount, null);
    assert.equal(collectionStatsAccount.quantityOfAttributes, 0);
  });

  it('should fail when max is not provided with a number', async () => {
    // arrange
    const attributesData = {
      name: 'attr1_name',
      kind: 1,
      modifier: null,
      size: null,
      max: null,
      maxLength: null,
    };
    let error: AnchorError | null = null;
    // act
    try {
      await program.methods
        .createCollectionAttribute(attributesData)
        .accounts({
          authority: provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          collection: collection.publicKey,
          attribute: attribute.publicKey,
        })
        .signers([attribute])
        .rpc();
    } catch (err) {
      error = err as AnchorError;
    }
    // assert
    assert.equal(error?.error.errorCode.number, 6011);
  });

  it('should fail when max length is not provided with a string', async () => {
    // arrange
    const attributesData = {
      name: 'attr1_name',
      kind: 2,
      modifier: null,
      size: null,
      max: null,
      maxLength: null,
    };
    let error: AnchorError | null = null;
    // act
    try {
      await program.methods
        .createCollectionAttribute(attributesData)
        .accounts({
          authority: provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          collection: collection.publicKey,
          attribute: attribute.publicKey,
        })
        .signers([attribute])
        .rpc();
    } catch (err) {
      error = err as AnchorError;
    }
    // assert
    assert.equal(error?.error.errorCode.number, 6012);
  });

  it('should fail when providing wrong "collection" to delete', async () => {
    // arrange
    const newCollection = Keypair.generate();
    const newCollectionName = 'sample';
    const newAttribute = Keypair.generate();
    const attributesData = {
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
        .createCollection({ name: newCollectionName })
        .accounts({
          authority: provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          collection: newCollection.publicKey,
        })
        .signers([newCollection])
        .rpc();
      await program.methods
        .createCollectionAttribute(attributesData)
        .accounts({
          authority: provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          collection: newCollection.publicKey,
          attribute: newAttribute.publicKey,
        })
        .signers([newAttribute])
        .rpc();
      await program.methods
        .deleteCollectionAttribute()
        .accounts({
          authority: provider.wallet.publicKey,
          workspace: workspace.publicKey,
          collection: collection.publicKey,
          attribute: newAttribute.publicKey,
        })
        .rpc();
    } catch (err) {
      error = err as AnchorError;
    }
    // assert
    assert.equal(error?.error.errorCode.number, 6037);
  });

  it('should fail when workspace has insufficient funds', async () => {
    // arrange
    const newWorkspace = Keypair.generate();
    const newWorkspaceName = 'sample';
    const newApplication = Keypair.generate();
    const newApplicationName = 'sample';
    const newCollection = Keypair.generate();
    const newCollectionName = 'sample';
    const newAttribute = Keypair.generate();
    const attributesData = {
      name: 'attr1_name',
      kind: 0,
      modifier: null,
      size: null,
      max: null,
      maxLength: null,
    };
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
            (await provider.connection.getMinimumBalanceForRentExemption(
              157 // collection account size
            )) +
            (await provider.connection.getMinimumBalanceForRentExemption(
              9 // collection stats account size
            )) +
            (await provider.connection.getMinimumBalanceForRentExemption(
              125 // application account size
            )) +
            (await provider.connection.getMinimumBalanceForRentExemption(
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
    try {
      await program.methods
        .createCollectionAttribute(attributesData)
        .accounts({
          authority: provider.wallet.publicKey,
          workspace: newWorkspace.publicKey,
          application: newApplication.publicKey,
          collection: newCollection.publicKey,
          attribute: newAttribute.publicKey,
        })
        .signers([newAttribute])
        .rpc();
    } catch (err) {
      error = err as AnchorError;
    }
    // assert
    assert.equal(error?.error.errorCode.number, 6027);
  });

  it('should fail when user is not a collaborator', async () => {
    // arrange
    const newUser = Keypair.generate();
    const newAttribute = Keypair.generate();
    const attributesData = {
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
        .createCollectionAttribute(attributesData)
        .accounts({
          authority: newUser.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          collection: collection.publicKey,
          attribute: newAttribute.publicKey,
        })
        .signers([newUser, newAttribute])
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
    const newAttribute = Keypair.generate();
    const attributesData = {
      name: 'attr1_name',
      kind: 0,
      modifier: null,
      size: null,
      max: null,
      maxLength: null,
    };
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
        workspace: workspace.publicKey,
        user: newUserPublicKey,
      })
      .signers([newUser])
      .rpc();

    try {
      await program.methods
        .createCollectionAttribute(attributesData)
        .accounts({
          authority: newUser.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          collection: collection.publicKey,
          attribute: newAttribute.publicKey,
        })
        .signers([newUser, newAttribute])
        .rpc();
    } catch (err) {
      error = err as AnchorError;
    }
    // assert
    assert.equal(error?.error.errorCode.number, 6029);
  });
});
