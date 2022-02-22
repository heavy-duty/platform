import { Program, ProgramError, Provider } from '@heavy-duty/anchor';
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
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
  let userPublicKey: PublicKey;
  let budgetPublicKey: PublicKey;

  before(async () => {
    [userPublicKey] = await PublicKey.findProgramAddress(
      [
        Buffer.from('user', 'utf8'),
        program.provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    );
    [budgetPublicKey] = await PublicKey.findProgramAddress(
      [Buffer.from('budget', 'utf8'), workspace.publicKey.toBuffer()],
      program.programId
    );
    [relationPublicKey] = await PublicKey.findProgramAddress(
      [
        Buffer.from('instruction_relation', 'utf8'),
        from.publicKey.toBuffer(),
        to.publicKey.toBuffer(),
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
      .createWorkspace({ name: workspaceName })
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
      })
      .signers([workspace])
      .postInstructions(
        SystemProgram.transfer({
          fromPubkey: program.provider.wallet.publicKey,
          toPubkey: budgetPublicKey,
          lamports: LAMPORTS_PER_SOL,
        })
      )
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
        workspace: workspace.publicKey,
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

  it('should fail when workspace has insufficient funds', async () => {
    // arrange
    const newWorkspace = Keypair.generate();
    const newWorkspaceName = 'sample';
    const newApplication = Keypair.generate();
    const newApplicationName = 'sample';
    const newInstruction = Keypair.generate();
    const newInstructionName = 'sample';
    const newFrom = Keypair.generate();
    const newTo = Keypair.generate();
    const [newBudgetPublicKey] = await PublicKey.findProgramAddress(
      [Buffer.from('budget', 'utf8'), newWorkspace.publicKey.toBuffer()],
      program.programId
    );
    let error: ProgramError | null = null;
    // act
    await program.methods
      .createWorkspace({ name: newWorkspaceName })
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: newWorkspace.publicKey,
      })
      .signers([newWorkspace])
      .postInstructions(
        SystemProgram.transfer({
          fromPubkey: program.provider.wallet.publicKey,
          toPubkey: newBudgetPublicKey,
          lamports:
            (await program.provider.connection.getMinimumBalanceForRentExemption(
              2155 // instruction account size
            )) +
            (await program.provider.connection.getMinimumBalanceForRentExemption(
              126 // application account size
            )) +
            (await program.provider.connection.getMinimumBalanceForRentExemption(
              295 // from account size
            )) +
            (await program.provider.connection.getMinimumBalanceForRentExemption(
              295 // to account size
            )),
        })
      )
      .rpc();
    await program.methods
      .createApplication({ name: newApplicationName })
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: newWorkspace.publicKey,
        application: newApplication.publicKey,
      })
      .signers([newApplication])
      .rpc();
    await program.methods
      .createInstruction({ name: newInstructionName })
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: newWorkspace.publicKey,
        application: newApplication.publicKey,
        instruction: newInstruction.publicKey,
      })
      .signers([newInstruction])
      .rpc();
    await program.methods
      .createInstructionAccount(fromDto)
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: newWorkspace.publicKey,
        application: newApplication.publicKey,
        instruction: newInstruction.publicKey,
        account: newFrom.publicKey,
      })
      .signers([newFrom])
      .rpc();
    await program.methods
      .createInstructionAccount(toDto)
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: newWorkspace.publicKey,
        application: newApplication.publicKey,
        instruction: newInstruction.publicKey,
        account: newTo.publicKey,
      })
      .signers([newTo])
      .rpc();
    try {
      await program.methods
        .createInstructionRelation()
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: newWorkspace.publicKey,
          application: newApplication.publicKey,
          instruction: newInstruction.publicKey,
          from: newFrom.publicKey,
          to: newTo.publicKey,
        })
        .rpc();
    } catch (err) {
      error = err as ProgramError;
    }
    // assert
    assert.equal(error?.code, 6027);
  });

  it('should fail when user is not a collaborator', async () => {
    // arrange
    const newUser = Keypair.generate();
    const newFrom = Keypair.generate();
    const newTo = Keypair.generate();
    let error: ProgramError | null = null;
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
    try {
      await program.methods
        .createInstructionRelation()
        .accounts({
          authority: newUser.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          from: newFrom.publicKey,
          to: newTo.publicKey,
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
    } catch (err) {
      error = err as ProgramError;
    }
    // assert
    assert.equal(error?.code, 3012);
  });

  it('should fail when user is not an approved collaborator', async () => {
    // arrange
    const newFrom = Keypair.generate();
    const newTo = Keypair.generate();
    const newUser = Keypair.generate();
    let error: ProgramError | null = null;
    // act
    const [newUserPublicKey] = await PublicKey.findProgramAddress(
      [Buffer.from('user', 'utf8'), newUser.publicKey.toBuffer()],
      program.programId
    );
    await program.methods
      .createUser()
      .accounts({
        authority: newUser.publicKey,
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
      .requestCollaboratorStatus()
      .accounts({
        authority: newUser.publicKey,
        user: newUserPublicKey,
        workspace: workspace.publicKey,
      })
      .signers([newUser])
      .rpc();
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

    try {
      await program.methods
        .createInstructionRelation()
        .accounts({
          authority: newUser.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          from: newFrom.publicKey,
          to: newTo.publicKey,
        })
        .signers([newUser])
        .rpc();
    } catch (err) {
      error = err as ProgramError;
    }
    // assert
    assert.equal(error?.code, 6029);
  });
});
