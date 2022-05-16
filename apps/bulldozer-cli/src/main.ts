import { config } from 'dotenv';
import { CommandFactory } from 'nest-commander';
import { AppModule } from './app/app.module';
import { BulldozerLogger } from './app/utils';

async function bootstrap() {
	config();
	const logger = new BulldozerLogger();
	logger.introMessage();
	await CommandFactory.run(AppModule, ['warn', 'error']);
}

bootstrap();
