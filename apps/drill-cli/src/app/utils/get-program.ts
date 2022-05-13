import { AnchorProvider, Program } from '@heavy-duty/anchor';
import { config } from 'dotenv';
import { Drill, IDL } from './drill_program_poc';

export const getProgram = (provider: AnchorProvider): Program<Drill> => {
  config();
  return new Program<Drill>(IDL, process.env.PROGRAM_ID, provider);
};
