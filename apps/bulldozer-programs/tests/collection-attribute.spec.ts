import { Program, ProgramError, Provider } from '@heavy-duty/anchor';
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
  const program = new Program<Bulldozer>(
    IDL,
    BULLDOZER_PROGRAM_ID,
    Provider.env()
  );
  const attribute = Keypair.generate();
  const collection = Keypair.generate();
  const application = Keypair.generate();
  const workspace = Keypair.generate();
  const applicationName = 'my-app';
  const workspaceName = 'my-workspace';
  const collectionName = 'my-collection';
  let userPublicKey: PublicKey;
  let budgetPublicKey: PublicKey;

  before(async () => {
    [userPublicKey] = await PublicKey.findProgramAddress(
      [
        Buffer.from('user', 'utf8'),
        program.provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    );
    [budgetPublicKey] = await PublicKey.findProgramAddress(
      [Buffer.from('budget', 'utf8'), workspace.publicKey.toBuffer()],
      program.programId
    );
    try {
      await program.methods
        .createUser()
        .accounts({
          authority: program.provider.wallet.publicKey,
        })
        .rpc();
    } catch (error) {}

    await program.methods
      .createWorkspace({ name: workspaceName })
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
      })
      .signers([workspace])
      .postInstructions(
        SystemProgram.transfer({
          fromPubkey: program.provider.wallet.publicKey,
          toPubkey: budgetPublicKey,
          lamports: LAMPORTS_PER_SOL,
        })
      )
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

    await program.methods
      .createCollection({ name: collectionName })
      .accounts({
        collection: collection.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        authority: program.provider.wallet.publicKey,
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
        authority: program.provider.wallet.publicKey,
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
    const collectionAccount = await program.account.collection.fetch(
      collection.publicKey
    );
    const decodedKind = decodeAttributeEnum(
      collectionAttributeAccount.kind as any
    );
    assert.ok(
      collectionAttributeAccount.authority.equals(
        program.provider.wallet.publicKey
      )
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
    assert.equal(collectionAccount.quantityOfAttributes, 1);
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
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
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
        authority: program.provider.wallet.publicKey,
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
    const collectionAccount = await program.account.collection.fetch(
      collection.publicKey
    );
    assert.equal(collectionAttributeAccount, null);
    assert.equal(collectionAccount.quantityOfAttributes, 0);
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
    let error: ProgramError | null = null;
    // act
    try {
      await program.methods
        .createCollectionAttribute(attributesData)
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          collection: collection.publicKey,
          attribute: attribute.publicKey,
        })
        .signers([attribute])
        .rpc();
    } catch (err) {
      error = err as ProgramError;
    }
    // assert
    assert.equal(error?.code, 6011);
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
    let error: ProgramError | null = null;
    // act
    try {
      await program.methods
        .createCollectionAttribute(attributesData)
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          collection: collection.publicKey,
          attribute: attribute.publicKey,
        })
        .signers([attribute])
        .rpc();
    } catch (err) {
      error = err as ProgramError;
    }
    // assert
    assert.equal(error?.code, 6012);
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
    let error: ProgramError | null = null;
    // act
    try {
      await program.methods
        .createCollection({ name: newCollectionName })
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          collection: newCollection.publicKey,
        })
        .signers([newCollection])
        .rpc();
      await program.methods
        .createCollectionAttribute(attributesData)
        .accounts({
          authority: program.provider.wallet.publicKey,
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
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          collection: collection.publicKey,
          attribute: newAttribute.publicKey,
        })
        .rpc();
    } catch (err) {
      error = err as ProgramError;
    }
    // assert
    assert.equal(error?.code, 6037);
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
    let error: ProgramError | null = null;
    // act
    await program.methods
      .createWorkspace({ name: newWorkspaceName })
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: newWorkspace.publicKey,
      })
      .signers([newWorkspace])
      .postInstructions(
        SystemProgram.transfer({
          fromPubkey: program.provider.wallet.publicKey,
          toPubkey: newBudgetPublicKey,
          lamports:
            (await program.provider.connection.getMinimumBalanceForRentExemption(
              157 // collection account size
            )) +
            (await program.provider.connection.getMinimumBalanceForRentExemption(
              126 // application account size
            )),
        })
      )
      .rpc();
    await program.methods
      .createApplication({ name: newApplicationName })
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: newWorkspace.publicKey,
        application: newApplication.publicKey,
      })
      .signers([newApplication])
      .rpc();
    await program.methods
      .createCollection({ name: newCollectionName })
      .accounts({
        authority: program.provider.wallet.publicKey,
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
          authority: program.provider.wallet.publicKey,
          workspace: newWorkspace.publicKey,
          application: newApplication.publicKey,
          collection: newCollection.publicKey,
          attribute: newAttribute.publicKey,
        })
        .signers([newAttribute])
        .rpc();
    } catch (err) {
      error = err as ProgramError;
    }
    // assert
    assert.equal(error?.code, 6027);
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
    let error: ProgramError | null = null;
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
            fromPubkey: program.provider.wallet.publicKey,
            toPubkey: newUser.publicKey,
            lamports: LAMPORTS_PER_SOL,
          }),
        ])
        .rpc();
    } catch (err) {
      error = err as ProgramError;
    }
    // assert
    assert.equal(error?.code, 3012);
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
    let error: ProgramError | null = null;
    // act
    const [newUserPublicKey] = await PublicKey.findProgramAddress(
      [Buffer.from('user', 'utf8'), newUser.publicKey.toBuffer()],
      program.programId
    );
    await program.methods
      .createUser()
      .accounts({
        authority: newUser.publicKey,
      })
      .signers([newUser])
      .preInstructions([
        SystemProgram.transfer({
          fromPubkey: program.provider.wallet.publicKey,
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
      error = err as ProgramError;
    }
    // assert
    assert.equal(error?.code, 6029);
  });
});
