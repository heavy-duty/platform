import { Module } from '@nestjs/common';
import { GenerateAppCommand } from './commands/generate-app.command';

@Module({
	imports: [],
	providers: [GenerateAppCommand],
})
export class AppModule {}
