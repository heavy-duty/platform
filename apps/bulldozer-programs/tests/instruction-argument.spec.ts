import { Program, ProgramError, Provider } from '@heavy-duty/anchor';
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import { assert } from 'chai';
import { Bulldozer, IDL } from '../target/types/bulldozer';
import { BULLDOZER_PROGRAM_ID, decodeAttributeEnum } from './utils';

describe('instruction argument', () => {
  const program = new Program<Bulldozer>(
    IDL,
    BULLDOZER_PROGRAM_ID,
    Provider.env()
  );
  const instruction = Keypair.generate();
  const instructionArgument = Keypair.generate();
  const instructionName = 'create_document';
  const application = Keypair.generate();
  const workspace = Keypair.generate();
  const applicationName = 'my-app';
  const workspaceName = 'my-workspace';
  let budgetPublicKey: PublicKey;

  before(async () => {
    [budgetPublicKey] = await PublicKey.findProgramAddress(
      [Buffer.from('budget', 'utf8'), workspace.publicKey.toBuffer()],
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
      .postInstructions([
        SystemProgram.transfer({
          fromPubkey: program.provider.wallet.publicKey,
          toPubkey: budgetPublicKey,
          lamports: LAMPORTS_PER_SOL,
        }),
      ])
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
  });

  it('should create account', async () => {
    // arrange
    const argumentsData = {
      name: 'attr1_name',
      kind: 0,
      modifier: null,
      size: null,
      max: null,
      maxLength: null,
    };
    // act
    await program.methods
      .createInstructionArgument(argumentsData)
      .accounts({
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        argument: instructionArgument.publicKey,
      })
      .signers([instructionArgument])
      .rpc();
    // assert
    const instructionArgumentAccount =
      await program.account.instructionArgument.fetch(
        instructionArgument.publicKey
      );
    const instructionAccount = await program.account.instruction.fetch(
      instruction.publicKey
    );
    const decodedKind = decodeAttributeEnum(
      instructionArgumentAccount.kind as any
    );
    assert.ok(
      instructionArgumentAccount.authority.equals(
        program.provider.wallet.publicKey
      )
    );
    assert.ok(instructionArgumentAccount.workspace.equals(workspace.publicKey));
    assert.ok(
      instructionArgumentAccount.application.equals(application.publicKey)
    );
    assert.ok(
      instructionArgumentAccount.instruction.equals(instruction.publicKey)
    );
    assert.equal(instructionArgumentAccount.name, argumentsData.name);
    assert.equal(decodedKind.name, 'boolean');
    assert.equal(decodedKind.id, argumentsData.kind);
    assert.equal(decodedKind.size, 1);
    assert.equal(instructionArgumentAccount.modifier, null);
    assert.equal(instructionAccount.quantityOfArguments, 1);
    assert.ok(
      instructionArgumentAccount.createdAt.eq(
        instructionArgumentAccount.updatedAt
      )
    );
  });

  it('should update account', async () => {
    // arrange
    const argumentsData = {
      name: 'attr1_name',
      kind: 1,
      modifier: 0,
      size: 5,
      max: 10,
      maxLength: null,
    };
    // act
    await program.methods
      .updateInstructionArgument(argumentsData)
      .accounts({
        authority: program.provider.wallet.publicKey,
        argument: instructionArgument.publicKey,
      })
      .rpc();
    // assert
    const account = await program.account.instructionArgument.fetch(
      instructionArgument.publicKey
    );
    const decodedKind = decodeAttributeEnum(account.kind as any);
    const decodedModifier = decodeAttributeEnum(account.modifier as any);
    assert.equal(account.name, argumentsData.name);
    assert.equal(decodedKind.id, argumentsData.kind);
    assert.equal(decodedKind.name, 'number');
    assert.equal(decodedKind.size, argumentsData.max);
    assert.equal(decodedModifier.id, argumentsData.modifier);
    assert.equal(decodedModifier.name, 'array');
    assert.equal(decodedModifier.size, argumentsData.size);
    assert.ok(account.createdAt.lte(account.updatedAt));
  });

  it('should delete account', async () => {
    // act
    await program.methods
      .deleteInstructionArgument()
      .accounts({
        authority: program.provider.wallet.publicKey,
        argument: instructionArgument.publicKey,
        instruction: instruction.publicKey,
      })
      .rpc();
    // assert
    const argumentAccount =
      await program.account.instructionArgument.fetchNullable(
        instructionArgument.publicKey
      );
    const instructionAccount = await program.account.instruction.fetch(
      instruction.publicKey
    );
    assert.equal(argumentAccount, null);
    assert.equal(instructionAccount.quantityOfArguments, 0);
  });

  it('should fail when max is not provided with a number', async () => {
    // arrange
    const argumentsData = {
      name: 'attr1_name',
      kind: 1,
      modifier: 0,
      size: null,
      max: null,
      maxLength: null,
    };
    let error: ProgramError | null = null;
    // act
    try {
      await program.methods
        .createInstructionArgument(argumentsData)
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          argument: instructionArgument.publicKey,
        })
        .signers([instructionArgument])
        .rpc();
    } catch (err) {
      error = err as ProgramError;
    }
    // assert
    assert.equal(error?.code, 6011);
  });

  it('should fail when max length is not provided with a string', async () => {
    // arrange
    const argumentsData = {
      name: 'attr1_name',
      kind: 2,
      modifier: 0,
      size: null,
      max: null,
      maxLength: null,
    };
    let error: ProgramError | null = null;
    // act
    try {
      await program.methods
        .createInstructionArgument(argumentsData)
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          argument: instructionArgument.publicKey,
        })
        .signers([instructionArgument])
        .rpc();
    } catch (err) {
      error = err as ProgramError;
    }
    // assert
    assert.equal(error?.code, 6012);
  });

  it('should fail when providing wrong "instruction" to delete', async () => {
    // arrange
    const newInstruction = Keypair.generate();
    const newInstructionName = 'sample';
    const newArgument = Keypair.generate();
    const argumentsData = {
      name: 'arg1_name',
      kind: 0,
      modifier: null,
      size: null,
      max: null,
      maxLength: null,
    };
    let error: ProgramError | null = null;
    // act
    try {
      await program.methods
        .createInstruction({ name: newInstructionName })
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: newInstruction.publicKey,
        })
        .signers([newInstruction])
        .rpc();
      await program.methods
        .createInstructionArgument(argumentsData)
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: newInstruction.publicKey,
          argument: newArgument.publicKey,
        })
        .signers([newArgument])
        .rpc();
      await program.methods
        .deleteInstructionArgument()
        .accounts({
          authority: program.provider.wallet.publicKey,
          instruction: instruction.publicKey,
          argument: newArgument.publicKey,
        })
        .rpc();
    } catch (err) {
      error = err as ProgramError;
    }
    // assert
    assert.equal(error?.code, 6041);
  });

  it('should fail when workspace has insufficient funds', async () => {
    // arrange
    const newWorkspace = Keypair.generate();
    const newWorkspaceName = 'sample';
    const newApplication = Keypair.generate();
    const newApplicationName = 'sample';
    const newInstruction = Keypair.generate();
    const newInstructionName = 'sample';
    const newArgument = Keypair.generate();
    const argumentsData = {
      name: 'attr1_name',
      kind: 0,
      modifier: null,
      size: null,
      max: null,
      maxLength: null,
    };
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
      .postInstructions([
        SystemProgram.transfer({
          fromPubkey: program.provider.wallet.publicKey,
          toPubkey: newBudgetPublicKey,
          lamports:
            (await program.provider.connection.getMinimumBalanceForRentExemption(
              2155 // instruction account size
            )) +
            (await program.provider.connection.getMinimumBalanceForRentExemption(
              125 // application account size
            )) +
            (await program.provider.connection.getMinimumBalanceForRentExemption(
              10 // application stats account size
            )),
        }),
      ])
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
    try {
      await program.methods
        .createInstructionArgument(argumentsData)
        .accounts({
          authority: program.provider.wallet.publicKey,
          workspace: newWorkspace.publicKey,
          application: newApplication.publicKey,
          instruction: newInstruction.publicKey,
          argument: newArgument.publicKey,
        })
        .signers([newArgument])
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
    const newArgument = Keypair.generate();
    const argumentsData = {
      name: 'attr1_name',
      kind: 0,
      modifier: null,
      size: null,
      max: null,
      maxLength: null,
    };
    let error: ProgramError | null = null;
    // act
    try {
      await program.methods
        .createInstructionArgument(argumentsData)
        .accounts({
          authority: newUser.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          argument: newArgument.publicKey,
        })
        .signers([newUser, newArgument])
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
    const newArgument = Keypair.generate();
    const argumentsData = {
      name: 'attr1_name',
      kind: 0,
      modifier: null,
      size: null,
      max: null,
      maxLength: null,
    };
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

    try {
      await program.methods
        .createInstructionArgument(argumentsData)
        .accounts({
          authority: newUser.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          argument: newArgument.publicKey,
        })
        .signers([newUser, newArgument])
        .rpc();
    } catch (err) {
      error = err as ProgramError;
    }
    // assert
    assert.equal(error?.code, 6029);
  });
});
