import { Module } from '@nestjs/common';
import { GenerateAppCommand } from './commands/generate-app.command';
import { GetInstructionCommand } from './commands/get-instruction.command';

@Module({
	imports: [],
	providers: [GenerateAppCommand, GetInstructionCommand],
})
export class AppModule {}
