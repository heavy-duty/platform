import { AnchorError, ProgramError } from '@heavy-duty/anchor';

export const getErrorMessage = (error: unknown) => {
	if (error instanceof Error) {
		return error.message;
	} else if (error instanceof ProgramError || error instanceof AnchorError) {
		return error.logs?.join('\n') ?? '';
	} else {
		return 'Internal Error';
	}
};
