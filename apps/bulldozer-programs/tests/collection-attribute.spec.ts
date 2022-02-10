import {
  Idl,
  Program,
  ProgramError,
  Provider,
  setProvider,
} from '@heavy-duty/anchor';
import { Keypair, SystemProgram, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js';
import { assert } from 'chai';
import * as bulldozerIdl from '../target/idl/bulldozer.json';
import { BULLDOZER_PROGRAM_ID } from './utils';

describe('collection attribute', () => {
  const program = new Program(bulldozerIdl as Idl, BULLDOZER_PROGRAM_ID);
  setProvider(Provider.env());
  const attribute = Keypair.generate();
  const collection = Keypair.generate();
  const collectionName = 'things';
  const application = Keypair.generate();
  const applicationName = 'my-app';
  const workspace = Keypair.generate();
  const workspaceName = 'my-workspace';

  before(async () => {
    await program.rpc.createWorkspace(
      { name: workspaceName },
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
        signers: [workspace],
      }
    );
    await program.rpc.createApplication(
      { name: applicationName },
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
        signers: [application],
      }
    );
    await program.rpc.createCollection(
      { name: collectionName },
      {
        accounts: {
          collection: collection.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          authority: program.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
        signers: [collection],
      }
    );
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
    await program.rpc.createCollectionAttribute(argumentsData, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        collection: collection.publicKey,
        attribute: attribute.publicKey,
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
      signers: [attribute],
    });
    // assert
    const collectionAttributeAccount =
      await program.account.collectionAttribute.fetch(attribute.publicKey);
    const collectionAccount = await program.account.collection.fetch(
      collection.publicKey
    );
    assert.ok(
      collectionAttributeAccount.authority.equals(
        program.provider.wallet.publicKey
      )
    );
    assert.equal(collectionAttributeAccount.name, argumentsData.name);
    assert.ok('boolean' in collectionAttributeAccount.kind);
    assert.equal(
      collectionAttributeAccount.kind.boolean.id,
      argumentsData.kind
    );
    assert.equal(collectionAttributeAccount.kind.boolean.size, 1);
    assert.equal(collectionAttributeAccount.modifier, null);
    assert.ok(
      collectionAttributeAccount.collection.equals(collection.publicKey)
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
    await program.rpc.updateCollectionAttribute(argumentsData, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        attribute: attribute.publicKey,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    });
    // assert
    const account = await program.account.collectionAttribute.fetch(
      attribute.publicKey
    );
    assert.equal(account.name, argumentsData.name);
    assert.ok('number' in account.kind);
    assert.equal(account.kind.number.id, argumentsData.kind);
    assert.equal(account.kind.number.size, argumentsData.max);
    assert.ok('array' in account.modifier);
    assert.equal(account.modifier.array.id, argumentsData.modifier);
    assert.equal(account.modifier.array.size, argumentsData.size);
    assert.ok(account.createdAt.lte(account.updatedAt));
  });

  it('should delete account', async () => {
    // act
    await program.rpc.deleteCollectionAttribute({
      accounts: {
        authority: program.provider.wallet.publicKey,
        collection: collection.publicKey,
        attribute: attribute.publicKey,
      },
    });
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
    let error: ProgramError;
    // act
    try {
      await program.rpc.createCollectionAttribute(argumentsData, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          collection: collection.publicKey,
          attribute: attribute.publicKey,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
        signers: [attribute],
      });
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6011);
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
    let error: ProgramError;
    // act
    try {
      await program.rpc.createCollectionAttribute(argumentsData, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          collection: collection.publicKey,
          attribute: attribute.publicKey,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
        signers: [attribute],
      });
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6012);
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
    let error: ProgramError;
    // act
    try {
      await program.rpc.createCollection(
        { name: newCollectionName },
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            application: application.publicKey,
            collection: newCollection.publicKey,
            systemProgram: SystemProgram.programId,
            clock: SYSVAR_CLOCK_PUBKEY,
          },
          signers: [newCollection],
        }
      );
      await program.rpc.createCollectionAttribute(argumentsData, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          collection: newCollection.publicKey,
          attribute: newAttribute.publicKey,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
        signers: [newAttribute],
      });
      await program.rpc.deleteCollectionAttribute({
        accounts: {
          authority: program.provider.wallet.publicKey,
          collection: collection.publicKey,
          attribute: newAttribute.publicKey,
        },
      });
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6014);
  });
});
