import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { IdlInstruction } from '../plugins';

const transformType = (type: string, value: string) => {
	if (type === 'publicKey') {
		return new PublicKey(value);
	} else if (type === 'u64') {
		return new BN(value);
	} else {
		return value;
	}
};

export const toInstructionArguments = (
	instruction: IdlInstruction,
	modelArgs: { [argName: string]: string }
): { [argName: string]: string | number | BN | PublicKey } => {
	return Object.keys(modelArgs).reduce((args, argName) => {
		const ixArg = instruction.args.find((arg) => arg.name === argName);

		if (ixArg === undefined) {
			return args;
		}

		if (typeof ixArg.type === 'string') {
			return {
				...args,
				[argName]: transformType(ixArg.type, modelArgs[argName]),
			};
		} else {
			if ('defined' in ixArg.type) {
				return {
					...args,
					[argName]: modelArgs[argName],
				};
			} else if ('option' in ixArg.type) {
				return {
					...args,
					[argName]: transformType(ixArg.type.option, modelArgs[argName]),
				};
			} else if ('coption' in ixArg.type) {
				return {
					...args,
					[argName]: transformType(ixArg.type.coption, modelArgs[argName]),
				};
			} else {
				return {
					...args,
					[argName]: modelArgs[argName],
				};
			}
		}
	}, {});
};
