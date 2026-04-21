import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TicketCreatedEvent } from '../events/ticket-created.event';
import { TicketsService } from '../tickets.service';
import { handleServiceError } from 'src/common/utils/service-error.handler';
import { MailService } from '../../common/services/mail/mail.service';

@Injectable()
export class GenerateTicketPdfListener {
  private readonly logger = new Logger(GenerateTicketPdfListener.name);

  constructor(
    private readonly ticketsService: TicketsService,
    private readonly mailService: MailService,
  ) {}

  @OnEvent('ticket.created')
  async handleTicketCreated(event: TicketCreatedEvent) {
    this.logger.debug(`Generating PDF for ticket: ${event.ticketId}`);

    try {
      const file = await this.ticketsService.generateTicketPdf(event.ticketId);
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
