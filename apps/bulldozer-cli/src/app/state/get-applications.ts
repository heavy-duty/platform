import { Program } from '@heavy-duty/anchor';
import { ApplicationFilters, applicationQueryBuilder } from '../query-builders';
import { Bulldozer } from '../utils/bulldozer';
import { Application, getApplication } from './get-application';

export const getApplications = async (
	program: Program<Bulldozer>,
	filters: ApplicationFilters
): Promise<Application[]> => {
	const query = applicationQueryBuilder().where(filters).build();

	const applicationIds = await program.provider.connection.getProgramAccounts(
		program.programId,
		{
			...query,
			dataSlice: {
				offset: 0,
				length: 0,
			},
		}
	);

	return Promise.all(
		applicationIds.map(({ pubkey }) => getApplication(program, pubkey))
	);
};
