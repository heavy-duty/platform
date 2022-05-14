import { AnchorProvider, Program } from '@heavy-duty/anchor';
import { Drill, IDL } from './drill';

export const getProgram = (provider: AnchorProvider): Program<Drill> => {
	return new Program<Drill>(IDL, process.env.PROGRAM_ID, provider);
};
