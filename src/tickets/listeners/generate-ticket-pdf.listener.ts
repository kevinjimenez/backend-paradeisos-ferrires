import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TicketsService } from '../tickets.service';
import { MailService } from '../../common/services/mail/mail.service';
import { TicketUpdatedEvent } from '../events/ticket-updated.event';
import { handleServiceError } from '../../common/utils/service-error.handler';
import { EVENTS } from '../../common/constants/events.constants';

@Injectable()
export class GenerateTicketPdfListener {
  private readonly logger = new Logger(GenerateTicketPdfListener.name);

  constructor(
    private readonly ticketsService: TicketsService,
    private readonly mailService: MailService,
  ) {}

  @OnEvent(EVENTS.TICKET_UPDATED)
  async handleTicketCreated(event: TicketUpdatedEvent) {
    try {
      this.logger.debug(`Ticket updated: ${event.ticketId}`);
      await this.ticketsService.update(event.ticketId, {
        status: event.ticketsStatus,
      });

      this.logger.debug(`Generating PDF for ticket: ${event.ticketId}`);
      const file = await this.ticketsService.generateTicketPdf(event.ticketId);

      this.logger.debug(`Sending email: ${event.ticketId}`);
      await this.mailService.sendMail({
        to: event.email,
        subject: 'Ticket Ferry Paredisos',
        html: 'test',
        attachments: [
          {
            filename: 'ticket.pdf',
            content: file,
            contentType: 'application/pdf',
          },
        ],
      });

      this.logger.log(`PDF generated for ticket: ${event.ticketId}`);
    } catch (error) {
      return handleServiceError(
        error,
        this.logger,
        'Failed to generate PDF for ticket',
      );
    }
  }
}
