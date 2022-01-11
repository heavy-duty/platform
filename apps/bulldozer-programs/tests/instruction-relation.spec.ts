import {
  Idl,
  Program,
  ProgramError,
  Provider,
  setProvider,
} from '@project-serum/anchor';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
} from '@solana/web3.js';
import { assert } from 'chai';
import * as bulldozerIdl from '../target/idl/bulldozer.json';
import { BULLDOZER_PROGRAM_ID } from './utils';

describe('instruction relation', () => {
  const program = new Program(bulldozerIdl as Idl, BULLDOZER_PROGRAM_ID);
  setProvider(Provider.env());
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
  let relationPublicKey: PublicKey, relationBump: number;

  before(async () => {
    await program.rpc.createWorkspace(
      { name: workspaceName },
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
        signers: [workspace],
      }
    );
    await program.rpc.createApplication(
      { name: applicationName },
      {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          systemProgram: SystemProgram.programId,
          clock: SYSVAR_CLOCK_PUBKEY,
        },
        signers: [application],
      }
    );
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
    await program.rpc.createInstructionAccount(fromDto, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        account: from.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [from],
    });
    await program.rpc.createInstructionAccount(toDto, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        account: to.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [to],
    });
    [relationPublicKey, relationBump] = await PublicKey.findProgramAddress(
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
    await program.rpc.createInstructionRelation(relationBump, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        from: from.publicKey,
        to: to.publicKey,
        relation: relationPublicKey,
        systemProgram: SystemProgram.programId,
      },
    });
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
  });

  it('should update', async () => {
    // act
    await program.rpc.updateInstructionRelation({
      accounts: {
        authority: program.provider.wallet.publicKey,
        from: to.publicKey,
        to: from.publicKey,
        relation: relationPublicKey,
      },
    });
    // assert
    const account = await program.account.instructionRelation.fetch(
      relationPublicKey
    );
    assert.ok(account.from.equals(to.publicKey));
    assert.ok(account.to.equals(from.publicKey));
  });

  it('should delete', async () => {
    const newFrom = Keypair.generate();
    const newTo = Keypair.generate();
    // act
    await program.rpc.createInstructionAccount(fromDto, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        account: newFrom.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [newFrom],
    });
    await program.rpc.createInstructionAccount(toDto, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        account: newTo.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [newTo],
    });
    const [newRelationPublicKey, newRelationBump] =
      await PublicKey.findProgramAddress(
        [
          Buffer.from('instruction_relation', 'utf8'),
          newFrom.publicKey.toBuffer(),
          newTo.publicKey.toBuffer(),
        ],
        program.programId
      );
    await program.rpc.createInstructionRelation(newRelationBump, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        workspace: workspace.publicKey,
        application: application.publicKey,
        instruction: instruction.publicKey,
        from: newFrom.publicKey,
        to: newTo.publicKey,
        relation: newRelationPublicKey,
        systemProgram: SystemProgram.programId,
      },
    });
    await program.rpc.deleteInstructionRelation({
      accounts: {
        authority: program.provider.wallet.publicKey,
        relation: newRelationPublicKey,
        from: newFrom.publicKey,
        to: newTo.publicKey,
      },
    });
    // assert
    const instructionRelationAccount =
      await program.account.instructionRelation.fetchNullable(
        newRelationPublicKey
      );
    assert.equal(instructionRelationAccount, null);
  });

  it('should fail if from and to are equal', async () => {
    let error: ProgramError;
    let [relationPublicKey, relationBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from('instruction_relation', 'utf8'),
        from.publicKey.toBuffer(),
        from.publicKey.toBuffer(),
      ],
      program.programId
    );
    // act
    try {
      await program.rpc.createInstructionRelation(relationBump, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          from: from.publicKey,
          to: from.publicKey,
          relation: relationPublicKey,
          systemProgram: SystemProgram.programId,
        },
      });
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 2003);
  });

  it('should fail when providing wrong "from" to delete', async () => {
    // arrange
    const newFrom = Keypair.generate();
    let error: ProgramError;
    // act
    try {
      await program.rpc.createInstructionAccount(fromDto, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          account: newFrom.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [newFrom],
      });
      const [newRelationPublicKey, newRelationBump] =
        await PublicKey.findProgramAddress(
          [
            Buffer.from('instruction_relation', 'utf8'),
            newFrom.publicKey.toBuffer(),
            to.publicKey.toBuffer(),
          ],
          program.programId
        );
      await program.rpc.createInstructionRelation(newRelationBump, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          from: newFrom.publicKey,
          to: to.publicKey,
          relation: newRelationPublicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      await program.rpc.deleteInstructionRelation({
        accounts: {
          authority: program.provider.wallet.publicKey,
          relation: newRelationPublicKey,
          from: from.publicKey,
          to: to.publicKey,
        },
      });
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6016);
  });

  it('should fail when providing wrong "to" to delete', async () => {
    // arrange
    const newTo = Keypair.generate();
    let error: ProgramError;
    // act
    try {
      await program.rpc.createInstructionAccount(toDto, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          account: newTo.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [newTo],
      });
      const [newRelationPublicKey, newRelationBump] =
        await PublicKey.findProgramAddress(
          [
            Buffer.from('instruction_relation', 'utf8'),
            from.publicKey.toBuffer(),
            newTo.publicKey.toBuffer(),
          ],
          program.programId
        );
      await program.rpc.createInstructionRelation(newRelationBump, {
        accounts: {
          authority: program.provider.wallet.publicKey,
          workspace: workspace.publicKey,
          application: application.publicKey,
          instruction: instruction.publicKey,
          from: from.publicKey,
          to: newTo.publicKey,
          relation: newRelationPublicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      await program.rpc.deleteInstructionRelation({
        accounts: {
          authority: program.provider.wallet.publicKey,
          relation: newRelationPublicKey,
          from: from.publicKey,
          to: to.publicKey,
        },
      });
    } catch (err) {
      error = err;
    }
    // assert
    assert.equal(error.code, 6017);
  });
});
