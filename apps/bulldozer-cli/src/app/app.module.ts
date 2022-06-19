import { Module } from '@nestjs/common';
import { BuildWorkspaceCommand } from './commands/build-workspace.command';
import { DeployWorkspaceCommand } from './commands/deploy-workspace.command';
import { GenerateApplicationCommand } from './commands/generate-application.command';
import { GenerateCollectionCommand } from './commands/generate-collection.command';
import { GenerateInstructionCommand } from './commands/generate-instruction.command';
import { GenerateWorkspaceCommand } from './commands/generate-workspace.command';
import { GetApplicationCommand } from './commands/get-application.command';
import { GetCollectionAttributeCommand } from './commands/get-collection-attribute.command';
import { GetCollectionCommand } from './commands/get-collection.command';
import { GetInstructionAccountCommand } from './commands/get-instruction-account.command';
import { GetInstructionArgumentCommand } from './commands/get-instruction-argument.command';
import { GetInstructionRelationCommand } from './commands/get-instruction-relation.command';
import { GetInstructionCommand } from './commands/get-instruction.command';
import { GetWorkspaceCommand } from './commands/get-workspace.command';

@Module({
	imports: [],
	providers: [
		GenerateInstructionCommand,
		GenerateApplicationCommand,
		GenerateCollectionCommand,
		GenerateWorkspaceCommand,
		DeployWorkspaceCommand,
		BuildWorkspaceCommand,
		GetWorkspaceCommand,
		GetApplicationCommand,
		GetCollectionCommand,
		GetCollectionAttributeCommand,
		GetInstructionCommand,
		GetInstructionArgumentCommand,
		GetInstructionAccountCommand,
		GetInstructionRelationCommand,
	],
})
export class AppModule {}
