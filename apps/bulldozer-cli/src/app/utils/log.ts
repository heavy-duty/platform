// import logSymbols from 'log-symbols';
import { LoggerService } from '@nestjs/common';
import * as figlet from 'figlet';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const chalk = require('chalk');
const orange = chalk.hex('#FFA500');

export class BulldozerLogger implements LoggerService {
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
				figlet.textSync('Bulldozer', {
					font: 'Graffiti',
					horizontalLayout: 'full',
				})
			)
		);
		console.log('');
		console.log('');
	}
}

export function log(message: string) {
	console.log(message);
}

// export function warn(message = '') {
//   log(`${logSymbols.warning} Warning: ${message}`);
// }

// export function info(message = '') {
//   log(`${logSymbols.info} Info: ${message}`);
// }

// export function error(message = '', error: string) {
//   log(`${logSymbols.error} ${chalk.red(`Error:`)} ${message}`);
//   console.log(error); // NOT, REMOVE
// }

// export function success(message = '') {
//   log(`${logSymbols.success} Success: ${message}`);
// }
