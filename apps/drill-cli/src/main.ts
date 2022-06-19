#!/usr/bin/env node
import { config } from 'dotenv';
import { CommandFactory } from 'nest-commander';
import { AppModule } from './app/app.module';
import { DrillLogger, isValidEnvironment } from './app/utils';

async function bootstrap() {
	config();
	const logger = new DrillLogger();
	logger.intro();

	// run some validations before start
	if (!isValidEnvironment()) {
		logger.warn(
			'Some environment vars are missing. Please check this before and run the command again.'
		);

		return;
	}

	await CommandFactory.run(AppModule, ['warn', 'error']);
}

bootstrap();
