import { Program, ProgramError, Provider } from '@heavy-duty/anchor';
import { Keypair } from '@solana/web3.js';
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
  const collectionName = 'things';
  const application = Keypair.generate();
  const applicationName = 'my-app';
  const workspace = Keypair.generate();
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
    const argumentsData = {
      name: 'attr1_name',
      kind: 0,
      modifier: null,
      size: null,
      max: null,
      maxLength: null,
    };
    // act
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
    assert.equal(collectionAttributeAccount.name, argumentsData.name);
    assert.equal(decodedKind.id, argumentsData.kind);
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
    const argumentsData = {
      name: 'attr2_name',
      kind: 1,
      modifier: 0,
      size: 5,
      max: 20,
      maxLength: null,
    };
    // act
    await program.methods
      .updateCollectionAttribute(argumentsData)
      .accounts({
        authority: program.provider.wallet.publicKey,
        attribute: attribute.publicKey,
      })
      .rpc();
    // assert
    const account = await program.account.collectionAttribute.fetch(
      attribute.publicKey
    );
    const decodedKind = decodeAttributeEnum(account.kind as any);
    const decodedModifier = decodeAttributeEnum(account.modifier as any);
    assert.equal(account.name, argumentsData.name);
    assert.equal(decodedKind.id, argumentsData.kind);
    assert.equal(decodedKind.name, 'number');
    assert.equal(decodedKind.size, argumentsData.max);
    assert.equal(decodedModifier.id, argumentsData.modifier);
    assert.equal(decodedModifier.name, 'array');
    assert.equal(decodedModifier.size, argumentsData.size);
    assert.ok(account.createdAt.lte(account.updatedAt));
  });

  it('should delete account', async () => {
    // act
    await program.methods
      .deleteCollectionAttribute()
      .accounts({
        authority: program.provider.wallet.publicKey,
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
    const argumentsData = {
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
    } catch (err) {
      error = err as ProgramError;
    }
    // assert
    assert.equal(error?.code, 6011);
  });

  it('should fail when max length is not provided with a string', async () => {
    // arrange
    const argumentsData = {
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
        .createCollectionAttribute(argumentsData)
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
          collection: collection.publicKey,
          attribute: newAttribute.publicKey,
        })
        .rpc();
    } catch (err) {
      error = err as ProgramError;
    }
    // assert
    assert.equal(error?.code, 6014);
  });
});
