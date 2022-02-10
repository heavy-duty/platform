import { Program, ProgramError, Provider } from '@heavy-duty/anchor';
import { Keypair } from '@solana/web3.js';
import { assert } from 'chai';
import { Bulldozer, IDL } from '../target/types/bulldozer';
import { BULLDOZER_PROGRAM_ID } from './utils';

describe('instruction', () => {
  const program = new Program<Bulldozer>(
    IDL,
    BULLDOZER_PROGRAM_ID,
    Provider.env()
  );
  const instruction = Keypair.generate();
  const application = Keypair.generate();
  const applicationName = 'my-app';
  const workspace = Keypair.generate();
  const workspaceName = 'my-workspace';

  before(async () => {
    await program.methods
      .createWorkspace({ name: workspaceName })
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
      })
      .signers([workspace])
      .rpc();
    await program.methods
      .createApplication({ name: applicationName })
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
      })
      .signers([application])
      .rpc();
  });

  it('should create account', async () => {
    // arrange
    const instructionName = 'create_document';
    // act
    await program.methods
      .createInstruction({ name: instructionName })
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
      })
      .signers([instruction])
      .rpc();
    // assert
    const account = await program.account.instruction.fetch(
      instruction.publicKey
    );
    const applicationAccount = await program.account.application.fetch(
      application.publicKey
    );
    assert.ok(account.authority.equals(program.provider.wallet.publicKey));
    assert.equal(account.name, instructionName);
    assert.equal(account.body, '');
    assert.ok(account.workspace.equals(workspace.publicKey));
    assert.ok(account.application.equals(application.publicKey));
    assert.equal(applicationAccount.quantityOfInstructions, 1);
    assert.ok(account.createdAt.eq(account.updatedAt));
  });

  it('should update account', async () => {
    // arrange
    const instructionName = 'update_document';
    // act
    await program.methods
      .updateInstruction({ name: instructionName })
      .accounts({
        authority: program.provider.wallet.publicKey,
        instruction: instruction.publicKey,
      })
      .rpc();
    // assert
    const account = await program.account.instruction.fetch(
      instruction.publicKey
    );
    assert.equal(account.name, instructionName);
    assert.ok(account.createdAt.lte(account.updatedAt));
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
    await program.methods
      .updateInstructionBody({ body: instructionBody })
      .accounts({
        authority: program.provider.wallet.publicKey,
        instruction: instruction.publicKey,
      })
      .rpc();
    // assert
    const account = await program.account.instruction.fetch(
      instruction.publicKey
    );
    assert.equal(account.body, instructionBody);
  });

  it('should delete account', async () => {
    // act
    await program.methods
      .deleteInstruction()
      .accounts({
        authority: program.provider.wallet.publicKey,
        instruction: instruction.publicKey,
        application: application.publicKey,
      })
      .rpc();
    // assert
    const account = await program.account.instruction.fetchNullable(
      instruction.publicKey
    );
    const applicationAccount = await program.account.application.fetch(
      application.publicKey
    );
    assert.equal(account, null);
    assert.equal(applicationAccount.quantityOfInstructions, 0);
  });

  it('should fail when deleting instruction with arguments', async () => {
    // arrange
    const instructionName = 'sample';
    const instruction = Keypair.generate();
    const argument = Keypair.generate();
    const argumentsData = {
      name: 'arg1_name',
      kind: 0,
      modifier: null,
      size: null,
      max: null,
      maxLength: null,
    };
    let error: ProgramError;
    // act
    try {
      await program.methods
        .createInstruction({ name: instructionName })
        .accounts({
          instruction: instruction.publicKey,
          application: application.publicKey,
          workspace: workspace.publicKey,
          authority: program.provider.wallet.publicKey,
        })
        .signers([instruction])
        .rpc();
      await program.methods
        .createInstructionArgument(argumentsData)
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          argument: argument.publicKey,
        })
        .signers([argument])
        .rpc();
      await program.methods
        .deleteInstruction()
        .accounts({
          instruction: instruction.publicKey,
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
        })
        .rpc();
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6016);
  });

  it('should fail when deleting instruction with accounts', async () => {
    // arrange
    const instructionName = 'sample';
    const instruction = Keypair.generate();
    const account = Keypair.generate();
    const argumentsData = {
      name: 'data',
      kind: 1,
      modifier: null,
      space: null,
    };
    let error: ProgramError;
    // act
    try {
      await program.methods
        .createInstruction({ name: instructionName })
        .accounts({
          instruction: instruction.publicKey,
          application: application.publicKey,
          workspace: workspace.publicKey,
          authority: program.provider.wallet.publicKey,
        })
        .signers([instruction])
        .rpc();
      await program.methods
        .createInstructionAccount(argumentsData)
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          account: account.publicKey,
        })
        .signers([account])
        .rpc();
      await program.methods
        .deleteInstruction()
        .accounts({
          instruction: instruction.publicKey,
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
        })
        .rpc();
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6018);
  });

  it('should fail when providing wrong "application" to delete', async () => {
    // arrange
    const newApplication = Keypair.generate();
    const newApplicationName = 'sample';
    const newInstruction = Keypair.generate();
    const newInstructionName = 'sample';
    let error: ProgramError;
    // act
    try {
      await program.methods
        .createApplication({ name: newApplicationName })
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: newApplication.publicKey,
        })
        .signers([newApplication])
        .rpc();
      await program.methods
        .createInstruction({ name: newInstructionName })
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: newApplication.publicKey,
          instruction: newInstruction.publicKey,
        })
        .signers([newInstruction])
        .rpc();
      await program.methods
        .deleteInstruction()
        .accounts({
          authority: program.provider.wallet.publicKey,
          application: application.publicKey,
          instruction: newInstruction.publicKey,
        })
        .rpc();
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6023);
  });
});
