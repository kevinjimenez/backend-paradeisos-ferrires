import { Module } from '@nestjs/common';
import { ContactsModule } from './../contacts/contacts.module';
import { PassengersModule } from './../passengers/passengers.module';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  imports: [ContactsModule, PassengersModule],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
