import { Module } from '@nestjs/common';
import { ContactsModule } from './../contacts/contacts.module';
import { PassengersModule } from './../passengers/passengers.module';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TicketPdfGenerator } from './generators/ticket-pdf.generator';

@Module({
  imports: [ContactsModule, PassengersModule],
  controllers: [TicketsController],
  providers: [TicketsService, TicketPdfGenerator],
})
export class TicketsModule {}
