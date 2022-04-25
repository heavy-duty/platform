import { AnchorError, AnchorProvider, BN, Program } from '@heavy-duty/anchor';
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
  let budgetPublicKey: PublicKey;
  const userUserName = 'user-name-1';
  const userName = 'User Name 1';
  const userThumbnailUrl = 'https://img/1.com';
  const newUserUserName = 'user-name-2';
  const newUserName = 'User Name 2';
  const newUserThumbnailUrl = 'https://img/2.com';
  const workspaceName = 'my-app';

  before(async () => {
    [userPublicKey] = await PublicKey.findProgramAddress(
      [Buffer.from('user', 'utf8'), provider.wallet.publicKey.toBuffer()],
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
      .createWorkspace({
        name: workspaceName,
      })
      .accounts({
        authority: provider.wallet.publicKey,
        workspace: workspace.publicKey,
      })
      .signers([workspace])
      .rpc();

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

  it('should deposit to budget', async () => {
    // arrange
    const amount = new BN(LAMPORTS_PER_SOL);
    const budgetBefore = await provider.connection.getAccountInfo(
      budgetPublicKey
    );
    // act
    await program.methods
      .depositToBudget({
        amount,
      })
      .accounts({
        authority: provider.wallet.publicKey,
        workspace: workspace.publicKey,
      })
      .rpc();
    // assert
    const budgetAfter = await provider.connection.getAccountInfo(
      budgetPublicKey
    );
    const budget = await program.account.budget.fetch(budgetPublicKey);
    assert.ok(
      new BN(budgetBefore?.lamports ?? 0)
        .add(amount)
        .eq(new BN(budgetAfter?.lamports ?? 0))
    );
    assert.ok(budget.totalDeposited.eq(amount));
    assert.ok(budget.totalValueLocked.eq(amount));
  });

  it('should when withdrawing unauthorized', async () => {
    // arrange
    const amount = new BN(LAMPORTS_PER_SOL);
    let error: AnchorError | null = null;
    // act
    try {
      await program.methods
        .withdrawFromBudget({
          amount,
        })
        .accounts({
          authority: newUser.publicKey,
          workspace: workspace.publicKey,
        })
        .signers([newUser])
        .rpc();
    } catch (err) {
      error = err as AnchorError;
    }
    // assert
    assert.equal(error?.error.errorCode.number, 6050);
  });

  it('should withdraw from budget', async () => {
    // arrange
    const amount = new BN(LAMPORTS_PER_SOL);
    const budgetBefore = await provider.connection.getAccountInfo(
      budgetPublicKey
    );
    // act
    await program.methods
      .withdrawFromBudget({
        amount,
      })
      .accounts({
        authority: provider.wallet.publicKey,
        workspace: workspace.publicKey,
      })
      .rpc();
    // assert
    const budgetAfter = await provider.connection.getAccountInfo(
      budgetPublicKey
    );
    const budget = await program.account.budget.fetch(budgetPublicKey);
    assert.ok(
      new BN(budgetBefore?.lamports ?? 0)
        .sub(amount)
        .eq(new BN(budgetAfter?.lamports ?? 0))
    );
    assert.ok(budget.totalDeposited.eq(amount));
    assert.ok(budget.totalValueLocked.eq(new BN(0)));
  });
});
