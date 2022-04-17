import { AnchorError, AnchorProvider, Program } from '@heavy-duty/anchor';
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import { assert } from 'chai';
import { Bulldozer, IDL } from '../target/types/bulldozer';
import { BULLDOZER_PROGRAM_ID } from './utils';

describe('workspace', () => {
  const provider = AnchorProvider.env();
  const program = new Program<Bulldozer>(IDL, BULLDOZER_PROGRAM_ID, provider);
  const workspace = Keypair.generate();
  const newUser = Keypair.generate();
  let userPublicKey: PublicKey;
  let newUserPublicKey: PublicKey;
  let budgetPublicKey: PublicKey;
  const userUserName = 'user-name-1';
  const userName = 'User Name 1';
  const userThumbnailUrl = 'https://img/1.com';
  const newUserUserName = 'user-name-2';
  const newUserName = 'User Name 2';
  const newUserThumbnailUrl = 'https://img/2.com';

  before(async () => {
    [userPublicKey] = await PublicKey.findProgramAddress(
      [Buffer.from('user', 'utf8'), provider.wallet.publicKey.toBuffer()],
      program.programId
    );
    [newUserPublicKey] = await PublicKey.findProgramAddress(
      [Buffer.from('user', 'utf8'), newUser.publicKey.toBuffer()],
      program.programId
    );
    [budgetPublicKey] = await PublicKey.findProgramAddress(
      [Buffer.from('budget', 'utf8'), workspace.publicKey.toBuffer()],
      program.programId
    );
    try {
      await program.methods
        .createUser({
          name: userName,
          thumbnailUrl: userThumbnailUrl,
          userName: userUserName,
        })
        .accounts({
          authority: provider.wallet.publicKey,
        })
        .rpc();
    } catch (error) {}

    await program.methods
      .createUser({
        name: newUserName,
        thumbnailUrl: newUserThumbnailUrl,
        userName: newUserUserName,
      })
      .accounts({
        authority: newUser.publicKey,
      })
      .signers([newUser])
      .preInstructions([
        SystemProgram.transfer({
          fromPubkey: provider.wallet.publicKey,
          toPubkey: newUser.publicKey,
          lamports: LAMPORTS_PER_SOL,
        }),
      ])
      .rpc();
  });

  it('should create account', async () => {
    // arrange
    const workspaceName = 'my-app';
    // act
    await program.methods
      .createWorkspace({
        name: workspaceName,
      })
      .accounts({
        authority: provider.wallet.publicKey,
        workspace: workspace.publicKey,
      })
      .postInstructions([
        SystemProgram.transfer({
          fromPubkey: provider.wallet.publicKey,
          toPubkey: budgetPublicKey,
          lamports: LAMPORTS_PER_SOL,
        }),
      ])
      .signers([workspace])
      .rpc();
    // assert
    const account = await program.account.workspace.fetch(workspace.publicKey);
    assert.ok(account.authority.equals(provider.wallet.publicKey));
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
        authority: provider.wallet.publicKey,
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
        authority: provider.wallet.publicKey,
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
    const [newBudgetPublicKey] = await PublicKey.findProgramAddress(
      [Buffer.from('budget', 'utf8'), newWorkspace.publicKey.toBuffer()],
      program.programId
    );
    let error: AnchorError | null = null;
    // act
    try {
      await program.methods
        .createWorkspace({
          name: newWorkspaceName,
        })
        .accounts({
          // This is temporal since anchor doesn't populate pda from a defined type argument
          workspace: newWorkspace.publicKey,
          authority: provider.wallet.publicKey,
          user: userPublicKey,
        })
        .signers([newWorkspace])
        .postInstructions([
          SystemProgram.transfer({
            fromPubkey: provider.wallet.publicKey,
            toPubkey: newBudgetPublicKey,
            lamports: LAMPORTS_PER_SOL,
          }),
        ])
        .rpc();
      await program.methods
        .createApplication({ name: applicationName })
        .accounts({
          authority: provider.wallet.publicKey,
          workspace: newWorkspace.publicKey,
          application: application.publicKey,
        })
        .signers([application])
        .rpc();
      await program.methods
        .deleteWorkspace()
        .accounts({
          authority: provider.wallet.publicKey,
          workspace: newWorkspace.publicKey,
        })
        .rpc();
    } catch (err) {
      error = err as AnchorError;
    }

    // assert
    assert.equal(error?.error.errorCode.number, 6024);
  });

  it('should fail when deleting workspace with collaborators', async () => {
    // arrange
    const newWorkspaceName = 'sample';
    const newWorkspace = Keypair.generate();
    let error: AnchorError | null = null;
    // act
    await program.methods
      .createWorkspace({
        name: newWorkspaceName,
      })
      .accounts({
        workspace: newWorkspace.publicKey,
        authority: provider.wallet.publicKey,
      })
      .signers([newWorkspace])
      .rpc();

    try {
      await program.methods
        .createCollaborator()
        .accounts({
          workspace: newWorkspace.publicKey,
          user: newUserPublicKey,
          authority: provider.wallet.publicKey,
        })
        .rpc();

      await program.methods
        .deleteWorkspace()
        .accounts({
          authority: provider.wallet.publicKey,
          workspace: newWorkspace.publicKey,
        })
        .rpc();
    } catch (err) {
      error = err as AnchorError;
    }
    // assert
    assert.equal(error?.error.errorCode.number, 6025);
  });

  it('should fail when user is not a collaborator', async () => {
    // arrange
    const newWorkspaceName = 'sample';
    const newUser = Keypair.generate();
    let error: AnchorError | null = null;
    // act
    try {
      await program.methods
        .updateWorkspace({ name: newWorkspaceName })
        .accounts({
          authority: newUser.publicKey,
          workspace: workspace.publicKey,
        })
        .signers([newUser])
        .preInstructions([
          SystemProgram.transfer({
            fromPubkey: provider.wallet.publicKey,
            toPubkey: newUser.publicKey,
            lamports: LAMPORTS_PER_SOL,
          }),
        ])
        .rpc();
    } catch (err) {
      error = err as AnchorError;
    }
    // assert
    assert.equal(error?.error.errorCode.number, 3012);
  });

  it('should fail when user is not an admin collaborator', async () => {
    // arrange
    const newWorkspace = Keypair.generate();
    const newWorkspaceName = 'sample';
    const newUser = Keypair.generate();
    let error: AnchorError | null = null;
    // act
    const [newUserPublicKey] = await PublicKey.findProgramAddress(
      [Buffer.from('user', 'utf8'), newUser.publicKey.toBuffer()],
      program.programId
    );
    await program.methods
      .createUser({
        name: newUserName,
        thumbnailUrl: newUserThumbnailUrl,
        userName: newUserUserName,
      })
      .accounts({
        authority: newUser.publicKey,
      })
      .signers([newUser])
      .preInstructions([
        SystemProgram.transfer({
          fromPubkey: provider.wallet.publicKey,
          toPubkey: newUser.publicKey,
          lamports: LAMPORTS_PER_SOL,
        }),
      ])
      .rpc();
    await program.methods
      .createWorkspace({
        name: newWorkspaceName,
      })
      .accounts({
        authority: provider.wallet.publicKey,
        workspace: newWorkspace.publicKey,
      })
      .signers([newWorkspace])
      .rpc();
    await program.methods
      .requestCollaboratorStatus()
      .accounts({
        authority: newUser.publicKey,
        user: newUserPublicKey,
        workspace: newWorkspace.publicKey,
      })
      .signers([newUser])
      .rpc();
    try {
      await program.methods
        .updateWorkspace({ name: newWorkspaceName })
        .accounts({
          authority: newUser.publicKey,
          workspace: newWorkspace.publicKey,
        })
        .signers([newUser])
        .rpc();
    } catch (err) {
      error = err as AnchorError;
    }
    // assert
    assert.equal(error?.error.errorCode.number, 6045);
  });
});
