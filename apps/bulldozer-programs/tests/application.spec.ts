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

describe('application', () => {
  const program = new Program(bulldozerIdl as Idl, BULLDOZER_PROGRAM_ID);
  setProvider(Provider.env());
  const workspaceName = 'my-workspace';
  const workspace = Keypair.generate();
  const application = Keypair.generate();
  const applicationName = 'my-app';

  before(async () => {
    await program.rpc.createWorkspace(workspaceName, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [workspace],
    });
  });

  it('should create account', async () => {
    // act
    await program.rpc.createApplication(applicationName, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
        workspace: workspace.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [application],
    });
    // assert
    const account = await program.account.application.fetch(
      application.publicKey
    );
    assert.ok(account.authority.equals(program.provider.wallet.publicKey));
    assert.ok(account.workspace.equals(workspace.publicKey));
    assert.equal(account.name, applicationName);
  });

  it('should update account', async () => {
    // arrange
    const applicationName = 'my-app2';
    // act
    await program.rpc.updateApplication(applicationName, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
      },
    });
    // assert
    const account = await program.account.application.fetch(
      application.publicKey
    );
    assert.equal(account.name, applicationName);
  });

  it('should delete account', async () => {
    // act
    await program.rpc.deleteApplication({
      accounts: {
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
      },
    });
    // assert
    const account = await program.account.application.fetchNullable(
      application.publicKey
    );
    assert.equal(account, null);
  });

  it('should fail when deleting application with collections', async () => {
    // arrange
    const newApplicationName = 'sample';
    const newApplication = Keypair.generate();
    const collectionName = 'sample';
    const collection = Keypair.generate();
    let error: ProgramError;
    // act
    try {
      await program.rpc.createApplication(newApplicationName, {
        accounts: {
          application: newApplication.publicKey,
          workspace: workspace.publicKey,
          authority: program.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [newApplication],
      });
      await program.rpc.createCollection(collectionName, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: newApplication.publicKey,
          collection: collection.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [collection],
      });
      await program.rpc.deleteApplication({
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: newApplication.publicKey,
        },
      });
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6022);
  });

  it('should fail when deleting application with instructions', async () => {
    // arrange
    const newApplicationName = 'sample';
    const newApplication = Keypair.generate();
    const instructionName = 'sample';
    const instruction = Keypair.generate();
    let error: ProgramError;
    // act
    try {
      await program.rpc.createApplication(newApplicationName, {
        accounts: {
          application: newApplication.publicKey,
          workspace: workspace.publicKey,
          authority: program.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [newApplication],
      });
      await program.rpc.createInstruction(instructionName, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: newApplication.publicKey,
          instruction: instruction.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [instruction],
      });
      await program.rpc.deleteApplication({
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: newApplication.publicKey,
        },
      });
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6024);
  });
});
