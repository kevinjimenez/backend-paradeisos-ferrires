import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DomainException } from 'src/common/exceptions/domain.exception';
import { PrismaTransaction } from 'src/common/types/prisma-transaction.type';
import { ContactsService } from 'src/contacts/contacts.service';
import { PassengersService } from 'src/passengers/passengers.service';
import { PaymentsRepository } from 'src/payments/payments.repository';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { TicketFactory } from '../factories/ticket.factory';
import { CreateTicketResponse } from '../interfaces/create-ticket-response.interface';
import { TicketsRepository } from '../tickets.repository';

@Injectable()
export class CreateTicketCommand {
  private readonly logger = new Logger(CreateTicketCommand.name);

  constructor(
    private readonly ticketsRepository: TicketsRepository,
    private readonly contactsService: ContactsService,
    private readonly passengersService: PassengersService,
    private readonly ticketFactory: TicketFactory,
    private readonly paymentsRepository: PaymentsRepository,
  ) {}

  async execute(
    dto: CreateTicketDto,
    tx: PrismaTransaction,
  ): Promise<CreateTicketResponse> {
    // 1. Crear contact
    const newContact = await this.contactsService.create(dto.contact);

    if (!newContact.id) {
      throw new DomainException(
        'Contact not created',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    // 2. Crear ticket
    const ticketToCreate = this.ticketFactory.createTicketData(
      dto,
      newContact.id,
    );
    const newTicket = await this.ticketsRepository.createTicket(
      ticketToCreate,
      tx,
    );

    this.logger.debug(`Created ticket: ${newTicket.id}`);

    // 3. Crear passengers
    const passengerCreated = await Promise.allSettled(
      dto.passenger.map((passengerDto) =>
        this.passengersService.create(
          {
            ...passengerDto,
            ticket: newTicket.id,
          },
          tx,
        ),
      ),
    );

    const passengerIds = passengerCreated
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value.id)
      .filter((id) => id !== undefined);

    // 4. Crear payment dentro de la transacción (atómico con el ticket)
    const newPayment = await this.paymentsRepository.createPending(
      newTicket.id,
      newTicket.total.toNumber(),
      tx,
    );

    this.logger.debug(
      `Created payment: ${newPayment.id} for ticket: ${newTicket.id}`,
    );

    return {
      id: newTicket.id,
      paymentId: newPayment.id,
      contact: newContact.id,
      passengers: passengerIds,
      total: newTicket.total.toNumber(),
      subtotal: newTicket.subtotal.toNumber(),
      taxes: newTicket.taxes.toNumber(),
      serviceFee: newTicket.service_fee.toNumber(),
      discount: newTicket.discount.toNumber(),
    };
  }
}
