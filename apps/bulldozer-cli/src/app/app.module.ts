import { Module } from '@nestjs/common';
import { BuildAppCommand } from './commands/build-app.command';
import { BuildWorkspaceCommand } from './commands/build-workspace.command';
import { DeployAppCommand } from './commands/deploy-app.command';
import { DeployWorkspaceCommand } from './commands/deploy-workspace.command';
import { GenerateAppCommand } from './commands/generate-app.command';
import { GenerateWorkspaceCommand } from './commands/generate-workspace.command';
import { GetApplicationCommand } from './commands/get-application.command';
import { GetCollectionAttributeCommand } from './commands/get-collection-attributes.command';
import { GetCollectionCommand } from './commands/get-collection.command';
import { GetInstructionAccountCommand } from './commands/get-instruction-account.command';
import { GetInstructionArgumentCommand } from './commands/get-instruction-argument.command';
import { GetInstructionRelationCommand } from './commands/get-instruction-relation.command';
import { GetInstructionCommand } from './commands/get-instruction.command';
import { GetWorkspaceCommand } from './commands/get-workspace.command';

@Module({
	imports: [],
	providers: [
		GenerateAppCommand,
		GenerateWorkspaceCommand,
		DeployAppCommand,
		DeployWorkspaceCommand,
		BuildAppCommand,
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
