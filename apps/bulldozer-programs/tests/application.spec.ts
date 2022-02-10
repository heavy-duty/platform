import { Program, ProgramError, Provider } from '@heavy-duty/anchor';
import { Keypair } from '@solana/web3.js';
import { assert } from 'chai';
import { Bulldozer, IDL } from '../target/types/bulldozer';
import { BULLDOZER_PROGRAM_ID } from './utils';

describe('application', () => {
  const program = new Program<Bulldozer>(
    IDL,
    BULLDOZER_PROGRAM_ID,
    Provider.env()
  );
  const workspaceName = 'my-workspace';
  const workspace = Keypair.generate();
  const application = Keypair.generate();
  const applicationName = 'my-app';

  before(async () => {
    await program.methods
      .createWorkspace({ name: workspaceName })
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
      })
      .signers([workspace])
      .rpc();
  });

  it('should create account', async () => {
    // act
    await program.methods
      .createApplication({ name: applicationName })
      .accounts({
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
        workspace: workspace.publicKey,
      })
      .signers([application])
      .rpc();
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
    await program.methods
      .updateApplication({ name: applicationName })
      .accounts({
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
      })
      .rpc();
    // assert
    const account = await program.account.application.fetch(
      application.publicKey
    );
    assert.equal(account.name, applicationName);
    assert.ok(account.createdAt.lte(account.updatedAt));
  });

  it('should delete account', async () => {
    // act
    await program.methods
      .deleteApplication()
      .accounts({
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
        workspace: workspace.publicKey,
      })
      .rpc();
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
      await program.methods
        .createApplication({ name: newApplicationName })
        .accounts({
          application: newApplication.publicKey,
          workspace: workspace.publicKey,
          authority: program.provider.wallet.publicKey,
        })
        .signers([newApplication])
        .rpc();
      await program.methods
        .createCollection({ name: collectionName })
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: newApplication.publicKey,
          collection: collection.publicKey,
        })
        .signers([collection])
        .rpc();
      await program.methods
        .deleteApplication()
        .accounts({
          authority: program.provider.wallet.publicKey,
          application: newApplication.publicKey,
          workspace: workspace.publicKey,
        })
        .rpc();
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6020);
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
      await program.methods
        .createApplication({ name: newApplicationName })
        .accounts({
          application: newApplication.publicKey,
          workspace: workspace.publicKey,
          authority: program.provider.wallet.publicKey,
        })
        .signers([newApplication])
        .rpc();
      await program.methods
        .createInstruction({ name: instructionName })
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: newApplication.publicKey,
          instruction: instruction.publicKey,
        })
        .signers([instruction])
        .rpc();
      await program.methods
        .deleteApplication()
        .accounts({
          authority: program.provider.wallet.publicKey,
          application: newApplication.publicKey,
          workspace: workspace.publicKey,
        })
        .rpc();
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6022);
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
      await program.methods
        .createWorkspace({ name: newWorkspaceName })
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: newWorkspace.publicKey,
        })
        .signers([newWorkspace])
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
        .deleteApplication()
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: newApplication.publicKey,
        })
        .rpc();
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6025);
  });
});
