import { Program, ProgramError, Provider } from '@heavy-duty/anchor';
import { Keypair } from '@solana/web3.js';
import { assert } from 'chai';
import { Bulldozer, IDL } from '../target/types/bulldozer';
import { BULLDOZER_PROGRAM_ID } from './utils';

describe('workspace', () => {
  const program = new Program<Bulldozer>(
    IDL,
    BULLDOZER_PROGRAM_ID,
    Provider.env()
  );
  const workspace = Keypair.generate();

  it('should create account', async () => {
    // arrange
    const workspaceName = 'my-app';
    // act
    await program.methods
      .createWorkspace({ name: workspaceName })
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
      })
      .signers([workspace])
      .rpc();
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
    await program.methods
      .updateWorkspace({ name: workspaceName })
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
      })
      .rpc();
    // assert
    const account = await program.account.workspace.fetch(workspace.publicKey);
    assert.ok(account.createdAt.lte(account.updatedAt));
    assert.equal(account.name, workspaceName);
  });

  it('should delete account', async () => {
    // act
    await program.methods
      .deleteWorkspace()
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
      })
      .rpc();
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
      await program.methods
        .createWorkspace({ name: newWorkspaceName })
        .accounts({
          workspace: newWorkspace.publicKey,
          authority: program.provider.wallet.publicKey,
        })
        .signers([newWorkspace])
        .rpc();
      await program.methods
        .createApplication({ name: applicationName })
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: newWorkspace.publicKey,
          application: application.publicKey,
        })
        .signers([application])
        .rpc();
      await program.methods
        .deleteWorkspace()
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: newWorkspace.publicKey,
        })
        .rpc();
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6024);
  });
});
