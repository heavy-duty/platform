/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { AppModule } from './app/app.module';

async function bootstrap() {
	config();
	const app = await NestFactory.create(AppModule);
	const port = process.env.PORT || 3333;
	app.enableCors({
		origin: process.env.WEB_CLIENT_URL,
	});
	await app.listen(port);
	Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
