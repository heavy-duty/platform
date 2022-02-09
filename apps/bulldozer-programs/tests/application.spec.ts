import {
  Idl,
  Program,
  ProgramError,
  Provider,
  setProvider,
} from '@project-serum/anchor';
import { Keypair, SystemProgram, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js';
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
  });

  it('should create account', async () => {
    // act
    await program.rpc.createApplication(
      { name: applicationName },
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          workspace: workspace.publicKey,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
        signers: [application],
      }
    );
    // assert
    const account = await program.account.application.fetch(
      application.publicKey
    );
    const workspaceAccount = await program.account.workspace.fetch(
      workspace.publicKey
    );
    assert.ok(account.authority.equals(program.provider.wallet.publicKey));
    assert.ok(account.workspace.equals(workspace.publicKey));
    assert.equal(account.name, applicationName);
    assert.equal(workspaceAccount.quantityOfApplications, 1);
    assert.ok(account.createdAt.eq(account.updatedAt));
  });

  it('should update account', async () => {
    // arrange
    const applicationName = 'my-app2';
    // act
    await program.rpc.updateApplication(
      { name: applicationName },
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
      }
    );
    // assert
    const account = await program.account.application.fetch(
      application.publicKey
    );
    assert.equal(account.name, applicationName);
    assert.ok(account.createdAt.lte(account.updatedAt));
  });

  it('should delete account', async () => {
    // act
    await program.rpc.deleteApplication({
      accounts: {
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
        workspace: workspace.publicKey,
      },
    });
    // assert
    const account = await program.account.application.fetchNullable(
      application.publicKey
    );
    const workspaceAccount = await program.account.workspace.fetch(
      workspace.publicKey
    );
    assert.equal(account, null);
    assert.equal(workspaceAccount.quantityOfApplications, 0);
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
      await program.rpc.createApplication(
        { name: newApplicationName },
        {
          accounts: {
            application: newApplication.publicKey,
            workspace: workspace.publicKey,
            authority: program.provider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
            clock: SYSVAR_CLOCK_PUBKEY,
          },
          signers: [newApplication],
        }
      );
      await program.rpc.createCollection(
        { name: collectionName },
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            application: newApplication.publicKey,
            collection: collection.publicKey,
            systemProgram: SystemProgram.programId,
            clock: SYSVAR_CLOCK_PUBKEY,
          },
          signers: [collection],
        }
      );
      await program.rpc.deleteApplication({
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: newApplication.publicKey,
          workspace: workspace.publicKey,
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
      await program.rpc.createApplication(
        { name: newApplicationName },
        {
          accounts: {
            application: newApplication.publicKey,
            workspace: workspace.publicKey,
            authority: program.provider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
            clock: SYSVAR_CLOCK_PUBKEY,
          },
          signers: [newApplication],
        }
      );
      await program.rpc.createInstruction(
        { name: instructionName },
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            workspace: workspace.publicKey,
            application: newApplication.publicKey,
            instruction: instruction.publicKey,
            systemProgram: SystemProgram.programId,
            clock: SYSVAR_CLOCK_PUBKEY,
          },
          signers: [instruction],
        }
      );
      await program.rpc.deleteApplication({
        accounts: {
          authority: program.provider.wallet.publicKey,
          application: newApplication.publicKey,
          workspace: workspace.publicKey,
        },
      });
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6024);
  });

  it('should fail when providing wrong "workspace" to delete', async () => {
    // arrange
    const newWorkspace = Keypair.generate();
    const newWorkspaceName = 'sample';
    const newApplication = Keypair.generate();
    const newApplicationName = 'sample';
    let error: ProgramError;
    // act
    try {
      await program.rpc.createWorkspace(
        { name: newWorkspaceName },
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            workspace: newWorkspace.publicKey,
            systemProgram: SystemProgram.programId,
            clock: SYSVAR_CLOCK_PUBKEY,
          },
          signers: [newWorkspace],
        }
      );
      await program.rpc.createApplication(
        { name: newApplicationName },
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            workspace: newWorkspace.publicKey,
            application: newApplication.publicKey,
            systemProgram: SystemProgram.programId,
            clock: SYSVAR_CLOCK_PUBKEY,
          },
          signers: [newApplication],
        }
      );
      await program.rpc.deleteApplication({
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: newApplication.publicKey,
        },
      });
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6027);
  });
});
