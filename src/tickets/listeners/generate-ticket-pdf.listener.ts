import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TicketCreatedEvent } from '../events/ticket-created.event';
import { TicketsService } from '../tickets.service';

@Injectable()
export class GenerateTicketPdfListener {
  private readonly logger = new Logger(GenerateTicketPdfListener.name);

  constructor(private readonly ticketsService: TicketsService) {}

  @OnEvent('ticket.created')
  async handleTicketCreated(event: TicketCreatedEvent) {
    this.logger.debug(`Generating PDF for ticket: ${event.ticketId}`);

    try {
      await this.ticketsService.generateTicketPdf(event.ticketId);

      this.logger.log(`PDF generated for ticket: ${event.ticketId}`);
    } catch (error) {
      this.logger.error(
        `Failed to generate PDF for ticket: ${event.ticketId}`,
        error,
      );
    }
  }
}
