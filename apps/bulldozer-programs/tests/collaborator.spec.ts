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

  it('should create collaborator', async () => {
    // act
    await program.methods
      .createCollaborator()
      .accounts({
        authority: program.provider.wallet.publicKey,
        user: newUserPublicKey,
        workspace: workspace.publicKey,
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
    assert.ok(collaboratorAccount.user.equals(newUserPublicKey));
    assert.ok(collaboratorAccount.workspace.equals(workspace.publicKey));
    assert.equal(workspaceAccount.quantityOfCollaborators, 2);
  });

  it('should delete collaborator', async () => {
    // act
    await program.methods
      .deleteCollaborator()
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        collaborator: collaboratorPublicKey,
      })
      .rpc();
    // assert
    const collaboratorAccount =
      await program.account.collaborator.fetchNullable(collaboratorPublicKey);
    const workspaceAccount = await program.account.workspace.fetch(
      workspace.publicKey
    );
    assert.equal(collaboratorAccount, null);
    assert.equal(workspaceAccount.quantityOfCollaborators, 1);
  });
});
