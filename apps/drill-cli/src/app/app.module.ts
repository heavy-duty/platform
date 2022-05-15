import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CreateBoardCommand } from './commands/create-board.command';
import { GetBoardBountyCommand } from './commands/get-board-bounty.command';
import { GetBoardCommand } from './commands/get-board.command';
import { SetBoardAuthorityCommand } from './commands/set-board-authority.command';

@Module({
	imports: [],
	controllers: [AppController],
	providers: [
		AppService,
		CreateBoardCommand,
		GetBoardCommand,
		GetBoardBountyCommand,
		SetBoardAuthorityCommand,
	],
})
export class AppModule {}
