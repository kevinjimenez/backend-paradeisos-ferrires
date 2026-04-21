import { Module } from '@nestjs/common';
import { ContactsModule } from './../contacts/contacts.module';
import { PassengersModule } from './../passengers/passengers.module';
import { PaymentsModule } from './../payments/payments.module';
import { CreateTicketCommand } from './commands/create-ticket.command';
import { TicketFactory } from './factories/ticket.factory';
import { TicketPdfGenerator } from './generators/ticket-pdf.generator';
import { TicketsController } from './tickets.controller';
import { TicketsRepository } from './tickets.repository';
import { TicketsService } from './tickets.service';
import { GenerateTicketPdfListener } from './listeners/generate-ticket-pdf.listener';

@Module({
  imports: [ContactsModule, PassengersModule, PaymentsModule],
  controllers: [TicketsController],
  providers: [
    TicketsService,
    TicketPdfGenerator,
    TicketsRepository,
    TicketFactory,
    CreateTicketCommand,
    GenerateTicketPdfListener,
  ],
  exports: [TicketsService, TicketsRepository],
})
export class TicketsModule {}
