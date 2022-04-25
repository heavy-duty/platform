import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EventsService } from './events.service';

@Module({
  providers: [EventsService, EventsGateway],
})
export class EventsModule {}
