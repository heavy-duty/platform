import { processError } from './errors';

export const isValidEnvironment = () => {
	if (!process.env.PROGRAM_ID) {
		processError({
			drillError: true,
			message:
				"PROGRAM ID not detected. Please provide one using 'export PROGRAM_ID=DR1LL87tP9uZqPXTxGDVrVE53zrLTBei3YLKrx4ihYh1' or something similar",
		});
		return false;
	}

	return true;
};
