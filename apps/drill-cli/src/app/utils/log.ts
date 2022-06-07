// import logSymbols from 'log-symbols';
import { LoggerService } from '@nestjs/common';
import * as figlet from 'figlet';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const chalk = require('chalk');
const orange = chalk.hex('#FFA500');

export class DrillLogger implements LoggerService {
	log(message: any, ...optionalParams: any[]) {
		console.log(chalk.blueBright(message));
	}

	error(message: any, ...optionalParams: any[]) {
		console.log(chalk.redBright(message));
	}

	warn(message: any, ...optionalParams: any[]) {
		console.log(chalk.yellowBright(message));
	}

	introMessage() {
		console.log(
			orange(
				figlet.textSync('Drill', {
					font: 'Graffiti',
					horizontalLayout: 'full',
				})
			)
		);
	}
}

export const log = (message: string) => {
	console.log(message);
};
