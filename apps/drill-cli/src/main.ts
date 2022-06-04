#!/usr/bin/env node
import { config } from 'dotenv';
import { CommandFactory } from 'nest-commander';
import { AppModule } from './app/app.module';
import { DrillLogger } from './app/utils';

async function bootstrap() {
	config();
	const logger = new DrillLogger();
	logger.introMessage();
	await CommandFactory.run(AppModule, ['warn', 'error']);
}

bootstrap();
