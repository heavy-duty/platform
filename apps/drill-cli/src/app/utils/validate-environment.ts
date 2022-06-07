export const isValidEnvironment = () => {
	if (!process.env.PROGRAM_ID) {
		console.error(
			"PROGRAM ID not detected. Please provide one using 'export PROGRAM_ID=DR1LL87tP9uZqPXTxGDVrVE53zrLTBei3YLKrx4ihYh1' or something similar"
		);
		// console.log(
		// 	'We can autogenerate a new PROGRAM ID, just provide a path to storage the metadata:'
		// );
		// Input data here
		return false;
	}

	return true;
};
