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

describe('workspace', () => {
  const program = new Program(bulldozerIdl as Idl, BULLDOZER_PROGRAM_ID);
  setProvider(Provider.env());
  const workspace = Keypair.generate();

  it('should create account', async () => {
    // arrange
    const workspaceName = 'my-app';
    // act
    await program.rpc.createWorkspace(workspaceName, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [workspace],
    });
    // assert
    const account = await program.account.workspace.fetch(workspace.publicKey);
    assert.ok(account.authority.equals(program.provider.wallet.publicKey));
    assert.equal(account.name, workspaceName);
  });

  it('should update account', async () => {
    // arrange
    const workspaceName = 'my-app2';
    // act
    await program.rpc.updateWorkspace(workspaceName, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
      },
    });
    // assert
    const account = await program.account.workspace.fetch(workspace.publicKey);
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
      await program.rpc.createWorkspace(newWorkspaceName, {
        accounts: {
          workspace: newWorkspace.publicKey,
          authority: program.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [newWorkspace],
      });
      await program.rpc.createApplication(applicationName, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: newWorkspace.publicKey,
          application: application.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [application],
      });
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
