/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { CommandFactory } from 'nest-commander';
import { AppModule } from './app/app.module';

async function bootstrap() {
	await CommandFactory.run(AppModule, ['warn', 'error']);
}

bootstrap();
