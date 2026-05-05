import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DomainException } from 'src/common/exceptions/domain.exception';
import { PrismaTransaction } from 'src/common/types/prisma-transaction.type';
import { ContactsService } from 'src/contacts/contacts.service';
import { FareExtrasService } from 'src/fare-extras/fare-extras.service';
import { FaresService } from 'src/fares/fares.service';
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
    private readonly faresService: FaresService,
    private readonly fareExtrasService: FareExtrasService,
    private readonly ticketFactory: TicketFactory,
    private readonly paymentsRepository: PaymentsRepository,
  ) {}

  async execute(
    dto: CreateTicketDto,
    tx: PrismaTransaction,
  ): Promise<CreateTicketResponse> {
    // 1. Resolver tarifas y extras, calcular unit_price por pasajero
    const fareIds = [...new Set(dto.passenger.map((p) => p.fareId))];
    const fareMap = new Map<string, number>();
    for (const fareId of fareIds) {
      const fare = await this.faresService.findById(fareId);
      if (!fare) {
        throw new DomainException(
          `Fare ${fareId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      fareMap.set(fareId, fare.price.toNumber());
    }

    const extraIds = [
      ...new Set(
        dto.passenger.flatMap((p) => (p.extras ?? []).map((e) => e.extraId)),
      ),
    ];
    const extrasMap = new Map<string, number>();
    for (const extraId of extraIds) {
      const extra = await this.fareExtrasService.findById(extraId);
      if (!extra) {
        throw new DomainException(
          `Fare extra ${extraId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      extrasMap.set(extraId, extra.price.toNumber());
    }

    const enrichedPassengers = dto.passenger.map((p) => {
      const extrasTotal = (p.extras ?? []).reduce(
        (sum, e) => sum + (extrasMap.get(e.extraId) ?? 0) * e.quantity,
        0,
      );
      return {
        ...p,
        unitPrice: p.basePrice + (fareMap.get(p.fareId) ?? 0) + extrasTotal,
        resolvedExtras: (p.extras ?? []).map((e) => ({
          extraId: e.extraId,
          quantity: e.quantity,
          unitPrice: extrasMap.get(e.extraId) ?? 0,
        })),
      };
    });
    const enrichedDto = { ...dto, passenger: enrichedPassengers };

    // 2. Crear contact
    const newContact = await this.contactsService.create(enrichedDto.contact);

    if (!newContact.id) {
      throw new DomainException(
        'Contact not created',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    // 3. Crear ticket
    const ticketToCreate = this.ticketFactory.createTicketData(
      enrichedDto,
      newContact.id,
    );
    const newTicket = await this.ticketsRepository.createTicket(
      ticketToCreate,
      tx,
    );

    this.logger.debug(`Created ticket: ${newTicket.id}`);

    // 4. Crear passengers
    const passengerCreated = await Promise.allSettled(
      enrichedDto.passenger.map((passengerDto) =>
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

    // 5. Crear payment dentro de la transacción (atómico con el ticket)
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
