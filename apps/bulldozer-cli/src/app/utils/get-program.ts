import { AnchorProvider, Program } from '@heavy-duty/anchor';
import { config } from 'dotenv';
import { Bulldozer, IDL } from './bulldozer';

export const getProgram = (provider: AnchorProvider): Program<Bulldozer> => {
	config();
	return new Program<Bulldozer>(IDL, process.env.PROGRAM_ID, provider);
};
