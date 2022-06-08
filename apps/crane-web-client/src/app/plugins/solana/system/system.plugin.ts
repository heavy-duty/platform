import { AnchorProvider, Native } from '@heavy-duty/anchor';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { toInstructionArguments } from '../../../utils';
import { IdlInstruction, PluginInterface } from '../../types';

export class SystemPlugin implements PluginInterface {
	private readonly program = Native.system({} as AnchorProvider);
	readonly namespace = 'solana';
	readonly name = this.program.idl.name;
	readonly instructions = this.program.idl.instructions;

	getInstruction(instructionName: string): IdlInstruction | null {
		return (
			this.instructions.find(
				(instruction) => instruction.name === instructionName
			) ?? null
		);
	}

	getTransactionInstruction(
		instructionName: string,
		args: { [argName: string]: string },
		accounts: { [accountName: string]: string }
	): TransactionInstruction | null {
		const instruction = this.getInstruction(instructionName);

		if (instruction === null) {
			return null;
		}

		return new TransactionInstruction({
			programId: new PublicKey(this.program.programId),
			keys: instruction.accounts.map((account) => ({
				pubkey: new PublicKey(accounts[account.name]),
				isSigner: account.isSigner,
				isWritable: account.isMut,
			})),
			data: this.program.coder.instruction.encode(
				instructionName,
				toInstructionArguments(instruction, args)
			),
		});
	}
}
