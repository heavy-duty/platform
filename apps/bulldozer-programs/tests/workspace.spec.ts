import { Program, ProgramError, Provider } from '@heavy-duty/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';
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
  let collaboratorPublicKey: PublicKey;

  before(async () => {
    [collaboratorPublicKey] = await PublicKey.findProgramAddress(
      [
        Buffer.from('collaborator', 'utf8'),
        workspace.publicKey.toBuffer(),
        program.provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    );
  });

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

  it('should add collaborator', async () => {
    // act
    await program.methods
      .addCollaborator()
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        receiver: program.provider.wallet.publicKey,
      })
      .rpc();
    // assert
    const collaboratorAccount = await program.account.collaborator.fetch(
      collaboratorPublicKey
    );
    const workspaceAccount = await program.account.workspace.fetch(
      workspace.publicKey
    );
    assert.ok(
      collaboratorAccount.authority.equals(program.provider.wallet.publicKey)
    );
    assert.ok(
      collaboratorAccount.owner.equals(program.provider.wallet.publicKey)
    );
    assert.ok(collaboratorAccount.workspace.equals(workspace.publicKey));
    assert.equal(workspaceAccount.quantityOfCollaborators, 1);
  });

  it('should delete collaborator', async () => {
    // act
    await program.methods
      .deleteCollaborator()
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        receiver: program.provider.wallet.publicKey,
      })
      .rpc();
    // assert
    const collaboratorAccount =
      await program.account.collaborator.fetchNullable(collaboratorPublicKey);
    const workspaceAccount = await program.account.workspace.fetch(
      workspace.publicKey
    );
    assert.equal(collaboratorAccount, null);
    assert.equal(workspaceAccount.quantityOfCollaborators, 0);
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
    let error: ProgramError | null = null;
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
      error = err as ProgramError;
    }
    // assert
    assert.equal(error?.code, 6024);
  });

  it('should fail when deleting workspace with collaborators', async () => {
    // arrange
    const newWorkspaceName = 'sample';
    const newWorkspace = Keypair.generate();
    let error: ProgramError | null = null;
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
        .addCollaborator()
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: newWorkspace.publicKey,
          receiver: program.provider.wallet.publicKey,
        })
        .rpc();
      await program.methods
        .deleteWorkspace()
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: newWorkspace.publicKey,
        })
        .rpc();
    } catch (err) {
      error = err as ProgramError;
    }
    // assert
    assert.equal(error?.code, 6025);
  });
});
