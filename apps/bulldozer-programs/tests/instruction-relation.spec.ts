import { Program, ProgramError, Provider } from '@heavy-duty/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';
import { assert } from 'chai';
import { Bulldozer, IDL } from '../target/types/bulldozer';
import { BULLDOZER_PROGRAM_ID } from './utils';

describe('instruction relation', () => {
  const program = new Program<Bulldozer>(
    IDL,
    BULLDOZER_PROGRAM_ID,
    Provider.env()
  );
  const instruction = Keypair.generate();
  const instructionName = 'create_document';
  const application = Keypair.generate();
  const applicationName = 'my-app';
  const workspace = Keypair.generate();
  const workspaceName = 'my-app';
  const from = Keypair.generate();
  const fromDto = {
    name: 'from',
    kind: 1,
    modifier: null,
    space: null,
  };
  const to = Keypair.generate();
  const toDto = {
    name: 'to',
    kind: 1,
    modifier: null,
    space: null,
  };
  let relationPublicKey: PublicKey;

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
    await program.methods
      .createInstructionAccount(fromDto)
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        account: from.publicKey,
      })
      .signers([from])
      .rpc();
    await program.methods
      .createInstructionAccount(toDto)
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        account: to.publicKey,
      })
      .signers([to])
      .rpc();
    [relationPublicKey] = await PublicKey.findProgramAddress(
      [
        Buffer.from('instruction_relation', 'utf8'),
        from.publicKey.toBuffer(),
        to.publicKey.toBuffer(),
      ],
      program.programId
    );
  });

  it('should create', async () => {
    // act
    await program.methods
      .createInstructionRelation()
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        from: from.publicKey,
        to: to.publicKey,
      })
      .rpc();
    // assert
    const instructionRelationAccount =
      await program.account.instructionRelation.fetch(relationPublicKey);
    const fromAccount = await program.account.instructionAccount.fetch(
      from.publicKey
    );
    const toAccount = await program.account.instructionAccount.fetch(
      to.publicKey
    );
    assert.ok(
      instructionRelationAccount.authority.equals(
        program.provider.wallet.publicKey
      )
    );
    assert.ok(
      instructionRelationAccount.instruction.equals(instruction.publicKey)
    );
    assert.ok(instructionRelationAccount.workspace.equals(workspace.publicKey));
    assert.ok(
      instructionRelationAccount.application.equals(application.publicKey)
    );
    assert.ok(instructionRelationAccount.from.equals(from.publicKey));
    assert.ok(instructionRelationAccount.to.equals(to.publicKey));
    assert.equal(fromAccount.quantityOfRelations, 1);
    assert.equal(toAccount.quantityOfRelations, 1);
    assert.ok(
      instructionRelationAccount.createdAt.eq(
        instructionRelationAccount.updatedAt
      )
    );
  });

  it('should delete', async () => {
    const newFrom = Keypair.generate();
    const newTo = Keypair.generate();
    // act
    await program.methods
      .createInstructionAccount(fromDto)
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        account: newFrom.publicKey,
      })
      .signers([newFrom])
      .rpc();
    await program.methods
      .createInstructionAccount(toDto)
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        account: newTo.publicKey,
      })
      .signers([newTo])
      .rpc();
    const [newRelationPublicKey] = await PublicKey.findProgramAddress(
      [
        Buffer.from('instruction_relation', 'utf8'),
        newFrom.publicKey.toBuffer(),
        newTo.publicKey.toBuffer(),
      ],
      program.programId
    );
    await program.methods
      .createInstructionRelation()
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        from: newFrom.publicKey,
        to: newTo.publicKey,
      })
      .rpc();
    await program.methods
      .deleteInstructionRelation()
      .accounts({
        authority: program.provider.wallet.publicKey,
        from: newFrom.publicKey,
        to: newTo.publicKey,
      })
      .rpc();
    // assert
    const instructionRelationAccount =
      await program.account.instructionRelation.fetchNullable(
        newRelationPublicKey
      );
    assert.equal(instructionRelationAccount, null);
  });

  it('should fail if from and to are equal', async () => {
    let error: ProgramError | null = null;
    // act
    try {
      await program.methods
        .createInstructionRelation()
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          from: from.publicKey,
          to: from.publicKey,
        })
        .rpc();
    } catch (err) {
      error = err as ProgramError;
    }
    // assert
    assert.equal(error?.code, 2003);
  });
});
