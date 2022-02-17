import { Program, Provider } from '@heavy-duty/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';
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
  const workspaceName = 'my-app';
  let collaboratorPublicKey: PublicKey;

  before(async () => {
    await program.methods
      .createWorkspace({ name: workspaceName })
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
      })
      .signers([workspace])
      .rpc();
    [collaboratorPublicKey] = await PublicKey.findProgramAddress(
      [
        Buffer.from('collaborator', 'utf8'),
        workspace.publicKey.toBuffer(),
        program.provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    );
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
});
