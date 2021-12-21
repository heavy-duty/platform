import {
  Idl,
  Program,
  ProgramError,
  Provider,
  setProvider,
  utils,
} from '@project-serum/anchor';
import { Keypair, SystemProgram } from '@solana/web3.js';
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
    await program.rpc.createCollection(collectionName, {
      accounts: {
        collection: collection.publicKey,
        workspace: workspace.publicKey,
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
      max: null,
      maxLength: null,
    };
    // act
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
    // assert
    const account = await program.account.collectionAttribute.fetch(
      attribute.publicKey
    );
    assert.ok(account.authority.equals(program.provider.wallet.publicKey));
    assert.equal(utils.bytes.utf8.decode(account.data.name), dto.name);
    assert.ok('boolean' in account.data.kind);
    assert.equal(account.data.kind.boolean.id, dto.kind);
    assert.equal(account.data.kind.boolean.size, 1);
    assert.equal(account.data.modifier, null);
    assert.ok(account.collection.equals(collection.publicKey));
    assert.ok(account.application.equals(application.publicKey));
    assert.ok(account.workspace.equals(workspace.publicKey));
  });

  it('should update account', async () => {
    // arrange
    const dto = {
      name: 'attr2_name',
      kind: 1,
      modifier: 0,
      size: 5,
      max: 20,
      maxLength: null,
    };
    // act
    await program.rpc.updateCollectionAttribute(dto, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        attribute: attribute.publicKey,
      },
    });
    // assert
    const account = await program.account.collectionAttribute.fetch(
      attribute.publicKey
    );
    assert.equal(utils.bytes.utf8.decode(account.data.name), dto.name);
    assert.ok('number' in account.data.kind);
    assert.equal(account.data.kind.number.id, dto.kind);
    assert.equal(account.data.kind.number.size, dto.max);
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
          workspace: workspace.publicKey,
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
    assert.equal(error.code, 6011);
  });

  it('should fail when max length is not provided with a string', async () => {
    // arrange
    const dto = {
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
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6012);
  });
});
