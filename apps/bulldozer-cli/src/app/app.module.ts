import { Module } from '@nestjs/common';
import { GenerateAppCommand } from './commands/generate-app.command';
import { GetInstructionArgumentCommand } from './commands/get-instruction-argument.command';
import { GetInstructionCommand } from './commands/get-instruction.command';

@Module({
	imports: [],
	providers: [
		GenerateAppCommand,
		GetInstructionCommand,
		GetInstructionArgumentCommand,
	],
})
export class AppModule {}
