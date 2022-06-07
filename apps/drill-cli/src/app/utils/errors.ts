import { log } from '.';

export interface DrillError {
	status?: number;
	response?: {
		data: {
			message: string;
		};
	};
	logs?: string[];
	drillError?: boolean;
	message?: string;
}

export const processError = (e: DrillError) => {
	switch (true) {
		case e.status !== undefined && e.response !== undefined:
			console.log('❌❌ Status Code: ', e.status, e.response.data.message);
			log(
				'❌❌ Repository or username not found. Please check the command input and try again!'
			);
			break;

		case e.logs !== undefined:
			log('❌❌ A Solana error occurred:');
			e.logs.forEach((element) => {
				log('> ' + element);
			});
			log(
				'❌❌ Please be sure you don`t have an already initialized Board with the Repo you are using, or that the Solana network is not down.'
			);
			break;
		case e.drillError !== undefined:
			log('❌❌ A Drill Cli error occurred:');
			log('> ' + e.message);
			log(
				'❌❌ Please add all the environment variables necessary to run the Drill CLI. See more info here'
			);
			break;
		default:
			log('Something go wrong. This error is not properly handle: ');
			console.log(e);
			break;
	}
	return;
};
