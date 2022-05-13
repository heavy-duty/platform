import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CreateBoardCommand } from './commands/create-board.command';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, CreateBoardCommand],
})
export class AppModule {}
