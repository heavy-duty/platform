import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

@Module({
	imports: [HttpModule],
	controllers: [AppController],
})
export class AppModule {}
