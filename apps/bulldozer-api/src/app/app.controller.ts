import { Controller, Get, Param, Query } from '@nestjs/common';
import { fromCommand } from './utils';

@Controller()
export class AppController {
	@Get('/get-workspace/:workspaceId')
	getWorkspace(@Param('workspaceId') workspaceId: string) {
		return fromCommand(`bulldozer get-workspace ${workspaceId} true`);
	}

	@Get('/get-application/:applicationId')
	getApplication(@Param('applicationId') applicationId: string) {
		return fromCommand(`bulldozer get-application ${applicationId} true`);
	}

	@Get('/get-application-code/:applicationId')
	getApplicationCode(
		@Param('applicationId') applicationId: string,
		@Query('programId') programId: string
	) {
		return fromCommand(
			`bulldozer generate-application ${applicationId} undefined ${programId} true`
		);
	}

	@Get('/get-collection/:collectionId')
	getCollection(@Param('collectionId') collectionId: string) {
		return fromCommand(`bulldozer get-collection ${collectionId} true`);
	}

	@Get('/get-collection-code/:collectionId')
	getCollectionCode(@Param('collectionId') collectionId: string) {
		return fromCommand(
			`bulldozer generate-collection ${collectionId} undefined true`
		);
	}

	@Get('/get-collection-attribute/:collectionAttributeId')
	getCollectionAttribute(
		@Param('collectionAttributeId') collectionAttributeId: string
	) {
		return fromCommand(
			`bulldozer get-collection-attribute ${collectionAttributeId} true`
		);
	}

	@Get('/get-instruction/:instructionId')
	getInstruction(@Param('instructionId') instructionId: string) {
		return fromCommand(`bulldozer get-instruction ${instructionId} true`);
	}

	@Get('/get-instruction-code/:instructionId')
	getInstructionCode(@Param('instructionId') instructionId: string) {
		return fromCommand(
			`bulldozer generate-instruction ${instructionId} undefined true`
		);
	}

	@Get('/get-instruction-argument/:instructionArgumentId')
	getInstructionArgument(
		@Param('instructionArgumentId') instructionArgumentId: string
	) {
		return fromCommand(
			`bulldozer get-instruction-argument ${instructionArgumentId} true`
		);
	}

	@Get('/get-instruction-account/:instructionAccountId')
	getInstructionAccount(
		@Param('instructionAccountId') instructionAccountId: string
	) {
		return fromCommand(
			`bulldozer get-instruction-account ${instructionAccountId} true`
		);
	}

	@Get('/get-instruction-relation/:instructionRelationId')
	getInstructionRelation(
		@Param('instructionRelationId') instructionRelationId: string
	) {
		return fromCommand(
			`bulldozer get-instruction-relation ${instructionRelationId} true`
		);
	}
}
