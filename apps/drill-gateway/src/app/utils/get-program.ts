import { AnchorProvider, Program } from '@heavy-duty/anchor';
import { DrillProgramPoc, IDL } from './drill_program_poc';

// TODO: read programId in some other way
const programId = '2fg324Gf51Nrp1jzxXETvJmXPEiHz9ybNY1r575MtijW';

export const getProgram = (
	provider: AnchorProvider
): Program<DrillProgramPoc> => {
	return new Program<DrillProgramPoc>(IDL, programId, provider);
};
