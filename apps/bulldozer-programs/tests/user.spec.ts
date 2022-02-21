import { Program, Provider } from '@heavy-duty/anchor';
import { PublicKey } from '@solana/web3.js';
import { assert } from 'chai';
import { Bulldozer, IDL } from '../target/types/bulldozer';
import { BULLDOZER_PROGRAM_ID } from './utils';

describe('workspace', () => {
  const program = new Program<Bulldozer>(
    IDL,
    BULLDOZER_PROGRAM_ID,
    Provider.env()
  );
  let userPublicKey: PublicKey,
    githubUserPublicKey: PublicKey,
    githubUserLinkPublicKey: PublicKey;
  const githubHandle = 'danmt';

  before(async () => {
    [userPublicKey] = await PublicKey.findProgramAddress(
      [
        Buffer.from('user', 'utf8'),
        program.provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    );
    [githubUserPublicKey] = await PublicKey.findProgramAddress(
      [Buffer.from('github_user', 'utf8'), Buffer.from(githubHandle, 'utf-8')],
      program.programId
    );
    [githubUserLinkPublicKey] = await PublicKey.findProgramAddress(
      [Buffer.from('github_user_link', 'utf8'), userPublicKey.toBuffer()],
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
  });

  it('should link github', async () => {
    // act
    await program.methods
      .linkGithub({
        handle: githubHandle,
      })
      .accounts({
        authority: program.provider.wallet.publicKey,
      })
      .rpc();
    // assert
    const githubUserAccount = await program.account.githubUser.fetch(
      githubUserPublicKey
    );
    const githubUserLinkAccount = await program.account.githubUserLink.fetch(
      githubUserLinkPublicKey
    );
    assert.equal(githubUserAccount.handle, githubHandle);
    assert.ok(
      githubUserAccount.authority.equals(program.provider.wallet.publicKey)
    );
    assert.ok(
      githubUserLinkAccount.authority.equals(program.provider.wallet.publicKey)
    );
    assert.ok(githubUserLinkAccount.user.equals(userPublicKey));
    assert.ok(githubUserLinkAccount.githubUser.equals(githubUserPublicKey));
  });
});
