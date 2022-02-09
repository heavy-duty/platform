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

describe('workspace', () => {
  const program = new Program(bulldozerIdl as Idl, BULLDOZER_PROGRAM_ID);
  setProvider(Provider.env());
  const workspace = Keypair.generate();

  it('should create account', async () => {
    // arrange
    const workspaceName = 'my-app';
    // act
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
    // assert
    const account = await program.account.workspace.fetch(workspace.publicKey);
    assert.ok(account.authority.equals(program.provider.wallet.publicKey));
    assert.equal(account.name, workspaceName);
    assert.ok(account.createdAt.eq(account.updatedAt));
  });

  it('should update account', async () => {
    // arrange
    const workspaceName = 'my-app2';
    // act
    await program.rpc.updateWorkspace(
      { name: workspaceName },
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
      }
    );
    // assert
    const account = await program.account.workspace.fetch(workspace.publicKey);
    assert.ok(account.createdAt.lte(account.updatedAt));
    assert.equal(account.name, workspaceName);
  });

  it('should delete account', async () => {
    // act
    await program.rpc.deleteWorkspace({
      accounts: {
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
      },
    });
    // assert
    const account = await program.account.workspace.fetchNullable(
      workspace.publicKey
    );
    assert.equal(account, null);
  });

  it('should fail when deleting workspace with applications', async () => {
    // arrange
    const newWorkspaceName = 'sample';
    const newWorkspace = Keypair.generate();
    const applicationName = 'sample';
    const application = Keypair.generate();
    let error: ProgramError;
    // act
    try {
      await program.rpc.createWorkspace(
        { name: newWorkspaceName },
        {
          accounts: {
            workspace: newWorkspace.publicKey,
            authority: program.provider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
            clock: SYSVAR_CLOCK_PUBKEY,
          },
          signers: [newWorkspace],
        }
      );
      await program.rpc.createApplication(
        { name: applicationName },
        {
          accounts: {
            authority: program.provider.wallet.publicKey,
            workspace: newWorkspace.publicKey,
            application: application.publicKey,
            systemProgram: SystemProgram.programId,
            clock: SYSVAR_CLOCK_PUBKEY,
          },
          signers: [application],
        }
      );
      await program.rpc.deleteWorkspace({
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: newWorkspace.publicKey,
        },
      });
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6026);
  });
});
