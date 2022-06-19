import { AnchorProvider, Program } from '@heavy-duty/anchor';
import { config } from 'dotenv';
import { Drill, IDL } from './drill';

export const getProgram = (provider: AnchorProvider): Program<Drill> => {
	config();
	return new Program<Drill>(IDL, process.env.PROGRAM_ID, provider);
};
