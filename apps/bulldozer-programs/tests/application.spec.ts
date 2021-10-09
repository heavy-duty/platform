import { Provider, setProvider, utils, workspace } from '@project-serum/anchor';
import { Keypair, SystemProgram } from '@solana/web3.js';
import { assert } from 'chai';

describe('application', () => {
  setProvider(Provider.env());
  const program = workspace.Bulldozer;
  const application = Keypair.generate();

  it('should create account', async () => {
    // arrange
    const applicationName = 'my-app';
    // act
    await program.rpc.createApplication(applicationName, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [application],
    });
    // assert
    const account = await program.account.application.fetch(
      application.publicKey
    );
    assert.ok(account.authority.equals(program.provider.wallet.publicKey));
    assert.equal(utils.bytes.utf8.decode(account.name), applicationName);
  });

  it('should update account', async () => {
    // arrange
    const applicationName = 'my-app2';
    // act
    await program.rpc.updateApplication(applicationName, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
      },
    });
    // assert
    const account = await program.account.application.fetch(
      application.publicKey
    );
    assert.equal(utils.bytes.utf8.decode(account.name), applicationName);
  });

  it('should delete account', async () => {
    // act
    await program.rpc.deleteApplication({
      accounts: {
        authority: program.provider.wallet.publicKey,
        application: application.publicKey,
      },
    });
    // assert
    const account = await program.account.application.fetchNullable(
      application.publicKey
    );
    assert.equal(account, null);
  });
});
