import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CreateBoardCommand } from './commands/generate-app.command';

@Module({
	imports: [],
	controllers: [AppController],
	providers: [AppService, CreateBoardCommand],
})
export class AppModule {}
