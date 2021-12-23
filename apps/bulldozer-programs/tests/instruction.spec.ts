import { Idl, Program, Provider, setProvider } from '@project-serum/anchor';
import { Keypair, SystemProgram } from '@solana/web3.js';
import { assert } from 'chai';

import * as bulldozerIdl from '../target/idl/bulldozer.json';
import { BULLDOZER_PROGRAM_ID } from './utils';

describe('instruction', () => {
  const program = new Program(bulldozerIdl as Idl, BULLDOZER_PROGRAM_ID);
  setProvider(Provider.env());
  const instruction = Keypair.generate();
  const application = Keypair.generate();
  const applicationName = 'my-app';
  const workspace = Keypair.generate();
  const workspaceName = 'my-workspace';

  before(async () => {
    await program.rpc.createWorkspace(workspaceName, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [workspace],
    });
    await program.rpc.createApplication(applicationName, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [application],
    });
  });

  it('should create account', async () => {
    // arrange
    const instructionName = 'create_document';
    // act
    await program.rpc.createInstruction(instructionName, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [instruction],
    });
    // assert
    const account = await program.account.instruction.fetch(
      instruction.publicKey
    );
    assert.ok(account.authority.equals(program.provider.wallet.publicKey));
    assert.equal(account.name, instructionName);
    assert.equal(account.body, '');
    assert.ok(account.workspace.equals(workspace.publicKey));
    assert.ok(account.application.equals(application.publicKey));
  });

  it('should update account', async () => {
    // arrange
    const instructionName = 'update_document';
    // act
    await program.rpc.updateInstruction(instructionName, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        instruction: instruction.publicKey,
      },
    });
    // assert
    const account = await program.account.instruction.fetch(
      instruction.publicKey
    );
    assert.equal(account.name, instructionName);
  });

  it('should update instruction body', async () => {
    // arrange
    const instructionBody = `
      msg!("Create instruction argument");
      ctx.accounts.argument.name = name;
      ctx.accounts.argument.kind = AttributeKind::from_index(kind)?;
      ctx.accounts.argument.modifier = AttributeKindModifier::from_index(modifier, size)?;
      ctx.accounts.argument.authority = ctx.accounts.authority.key();
      ctx.accounts.argument.instruction = ctx.accounts.instruction.key();
      ctx.accounts.argument.application = ctx.accounts.application.key();
    `;
    // act
    await program.rpc.updateInstructionBody(instructionBody, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        instruction: instruction.publicKey,
      },
    });
    // assert
    const account = await program.account.instruction.fetch(
      instruction.publicKey
    );
    assert.equal(account.body, instructionBody);
  });

  it('should delete account', async () => {
    // act
    await program.rpc.deleteInstruction({
      accounts: {
        authority: program.provider.wallet.publicKey,
        instruction: instruction.publicKey,
      },
    });
    // assert
    const account = await program.account.instruction.fetchNullable(
      instruction.publicKey
    );
    assert.equal(account, null);
  });
});
