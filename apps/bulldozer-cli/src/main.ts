/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { config } from 'dotenv';
import { CommandFactory } from 'nest-commander';
import { AppModule } from './app/app.module';

async function bootstrap() {
	config();

	await CommandFactory.run(AppModule, ['warn', 'error']);
}

bootstrap();
