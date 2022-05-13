import { AnchorProvider, Program } from '@heavy-duty/anchor';
import { Drill, IDL } from './drill';

// TODO: read programId in some other way
const programId = 'ARp7sigi8EAfyi5omv7jKZTy9NJaQz7Bh6dt4urzFjWt';

export const getProgram = (provider: AnchorProvider): Program<Drill> => {
	return new Program<Drill>(IDL, programId, provider);
};
