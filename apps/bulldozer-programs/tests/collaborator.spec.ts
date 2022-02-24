import { Program, Provider } from '@heavy-duty/anchor';
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import { assert } from 'chai';
import { Bulldozer, IDL } from '../target/types/bulldozer';
import { BULLDOZER_PROGRAM_ID } from './utils';

describe('collaborator', () => {
  const program = new Program<Bulldozer>(
    IDL,
    BULLDOZER_PROGRAM_ID,
    Provider.env()
  );
  const workspace = Keypair.generate();
  const newUser = Keypair.generate();
  const workspaceName = 'my-app';
  let collaboratorPublicKey: PublicKey;
  let newCollaboratorPublicKey: PublicKey;
  let userPublicKey: PublicKey;
  let newUserPublicKey: PublicKey;

  before(async () => {
    [userPublicKey] = await PublicKey.findProgramAddress(
      [
        Buffer.from('user', 'utf8'),
        program.provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    );
    [newUserPublicKey] = await PublicKey.findProgramAddress(
      [Buffer.from('user', 'utf8'), newUser.publicKey.toBuffer()],
      program.programId
    );
    [collaboratorPublicKey] = await PublicKey.findProgramAddress(
      [
        Buffer.from('collaborator', 'utf8'),
        workspace.publicKey.toBuffer(),
        userPublicKey.toBuffer(),
      ],
      program.programId
    );
    [newCollaboratorPublicKey] = await PublicKey.findProgramAddress(
      [
        Buffer.from('collaborator', 'utf8'),
        workspace.publicKey.toBuffer(),
        newUserPublicKey.toBuffer(),
      ],
      program.programId
    );

    try {
      await program.methods
        .createUser()
        .accounts({
          authority: program.provider.wallet.publicKey,
        })
        .rpc();
    } catch (error) {}

    await program.methods
      .createUser()
      .accounts({
        authority: newUser.publicKey,
        user: newUserPublicKey,
      })
      .signers([newUser])
      .preInstructions([
        SystemProgram.transfer({
          fromPubkey: program.provider.wallet.publicKey,
          toPubkey: newUser.publicKey,
          lamports: LAMPORTS_PER_SOL,
        }),
      ])
      .rpc();

    await program.methods
      .createWorkspace({ name: workspaceName })
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
      })
      .signers([workspace])
      .rpc();
  });

  it('should create admin collaborator', async () => {
    // assert
    const collaboratorAccount = await program.account.collaborator.fetch(
      collaboratorPublicKey
    );
    assert.ok(
      collaboratorAccount.authority.equals(program.provider.wallet.publicKey)
    );
    assert.equal(collaboratorAccount.isAdmin, true);
    assert.ok('approved' in collaboratorAccount.status);
  });

  it('should request collaborator status', async () => {
    // act
    await program.methods
      .requestCollaboratorStatus()
      .accounts({
        authority: newUser.publicKey,
        workspace: workspace.publicKey,
      })
      .signers([newUser])
      .rpc();
    // assert
    const collaboratorAccount = await program.account.collaborator.fetch(
      newCollaboratorPublicKey
    );
    const workspaceAccount = await program.account.workspace.fetch(
      workspace.publicKey
    );
    assert.ok(collaboratorAccount.authority.equals(newUser.publicKey));
    assert.equal(collaboratorAccount.isAdmin, false);
    assert.ok('pending' in collaboratorAccount.status);
    assert.ok(collaboratorAccount.user.equals(newUserPublicKey));
    assert.ok(collaboratorAccount.workspace.equals(workspace.publicKey));
    assert.equal(workspaceAccount.quantityOfCollaborators, 2);
  });

  it('should approve collaborator', async () => {
    // act
    await program.methods
      .updateCollaborator({ status: 1 })
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        collaborator: newCollaboratorPublicKey,
      })
      .rpc();
    // assert
    const collaboratorAccount = await program.account.collaborator.fetch(
      newCollaboratorPublicKey
    );
    assert.ok('approved' in collaboratorAccount.status);
  });

  it('should delete collaborator', async () => {
    // act
    await program.methods
      .deleteCollaborator()
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        collaborator: newCollaboratorPublicKey,
      })
      .rpc();
    // assert
    const collaboratorAccount =
      await program.account.collaborator.fetchNullable(
        newCollaboratorPublicKey
      );
    const workspaceAccount = await program.account.workspace.fetch(
      workspace.publicKey
    );
    assert.equal(collaboratorAccount, null);
    assert.equal(workspaceAccount.quantityOfCollaborators, 1);
  });

  it('should reject collaborator status request', async () => {
    // act
    await program.methods
      .requestCollaboratorStatus()
      .accounts({
        authority: newUser.publicKey,
        workspace: workspace.publicKey,
      })
      .signers([newUser])
      .rpc();
    await program.methods
      .updateCollaborator({ status: 2 })
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        collaborator: newCollaboratorPublicKey,
      })
      .rpc();
    // assert
    const collaboratorAccount = await program.account.collaborator.fetch(
      newCollaboratorPublicKey
    );
    assert.ok('rejected' in collaboratorAccount.status);
  });

  it('should retry collaborator status request', async () => {
    // act
    await program.methods
      .retryCollaboratorStatusRequest()
      .accounts({
        authority: newUser.publicKey,
        workspace: workspace.publicKey,
      })
      .signers([newUser])
      .rpc();
    // assert
    const collaboratorAccount = await program.account.collaborator.fetch(
      newCollaboratorPublicKey
    );
    assert.ok('pending' in collaboratorAccount.status);
  });
});
