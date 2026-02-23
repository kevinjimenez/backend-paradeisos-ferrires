import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PaymentMethod } from 'src/databases/generated/prisma/enums';
import { PaymentsService } from 'src/payments/payments.service';
import { TicketCreatedEvent } from '../events/ticket-created.event';

@Injectable()
export class CreatePaymentListener {
  private readonly logger = new Logger(CreatePaymentListener.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @OnEvent('ticket.created')
  async handleTicketCreated(event: TicketCreatedEvent) {
    this.logger.debug(`Creating pending payment for ticket: ${event.ticketId}`);

    try {
      await this.paymentsService.create({
        ticketId: event.ticketId,
        amount: event.total,
        paymentMethod: PaymentMethod.credit_card,
        paymentProvider: 'payphone',
      });

      this.logger.log(`Payment created for ticket: ${event.ticketId}`);
    } catch (error) {
      this.logger.error(
        `Failed to create payment for ticket: ${event.ticketId}`,
        error,
      );
    }
  }
}
