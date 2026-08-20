import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DomainException } from 'src/common/exceptions/domain.exception';
import { PrismaTransaction } from 'src/common/types/prisma-transaction.type';
import { ContactsService } from 'src/contacts/contacts.service';
import { FareExtrasService } from 'src/fare-extras/fare-extras.service';
import { FaresService } from 'src/fares/fares.service';
import { PassengersService } from 'src/passengers/passengers.service';
import { PaymentsRepository } from 'src/payments/payments.repository';
import { SchedulesService } from 'src/schedules/schedules.service';
import { PassengerInputDto } from 'src/passengers/dto/create-passenger.dto';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { TicketFactory } from '../factories/ticket.factory';
import { CreateTicketResponse } from '../interfaces/create-ticket-response.interface';
import { TicketsRepository } from '../tickets.repository';

const ISABELA_CODE = 'ISA';
const WATER_TAXI_CODE = 'WATER_TAXI';
const ISABELA_PIER_FEE_CODE = 'ISABELA_PIER_FEE';
const ISABELA_FEE_NATIONAL = 5;
const ISABELA_FEE_FOREIGN = 10;
const NATIONAL_COUNTRY_CODE = 'EC';

interface MandatoryFeeExtra {
  extraId: string;
  quantity: number;
  unitPrice: number;
}

@Injectable()
export class CreateTicketCommand {
  private readonly logger = new Logger(CreateTicketCommand.name);

  constructor(
    private readonly ticketsRepository: TicketsRepository,
    private readonly contactsService: ContactsService,
    private readonly passengersService: PassengersService,
    private readonly faresService: FaresService,
    private readonly fareExtrasService: FareExtrasService,
    private readonly schedulesService: SchedulesService,
    private readonly ticketFactory: TicketFactory,
    private readonly paymentsRepository: PaymentsRepository,
  ) {}

  async execute(
    dto: CreateTicketDto,
    tx: PrismaTransaction,
  ): Promise<CreateTicketResponse> {
    // 1. Resolver tarifas y extras, calcular unit_price por pasajero
    const fareIds = [
      ...new Set([
        ...dto.passenger.map((p) => p.outboundFareId),
        ...dto.passenger.flatMap((p) =>
          p.returnFareId ? [p.returnFareId] : [],
        ),
      ]),
    ];
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

    // 1b. Cargos obligatorios (taxi acuático + tasa de muelle Isabela) — se
    // calculan e inyectan por pasajero, el cliente no los envía.
    const mandatoryExtrasByPassenger = await this.resolveMandatoryExtras(dto);

    const enrichedPassengers: PassengerInputDto[] = dto.passenger.map(
      (p, index) => {
        const mandatoryExtras = mandatoryExtrasByPassenger[index];
        const extrasTotal = (p.extras ?? []).reduce(
          (sum, e) => sum + (extrasMap.get(e.extraId) ?? 0) * e.quantity,
          0,
        );
        const mandatoryExtrasTotal = mandatoryExtras.reduce(
          (sum, e) => sum + e.unitPrice * e.quantity,
          0,
        );

        return {
          ...p,
          unitPrice:
            p.basePrice +
            (fareMap.get(p.outboundFareId) ?? 0) +
            (p.returnFareId ? (fareMap.get(p.returnFareId) ?? 0) : 0) +
            extrasTotal +
            mandatoryExtrasTotal,
          resolvedExtras: [
            ...(p.extras ?? []).map((e) => ({
              extraId: e.extraId,
              quantity: e.quantity,
              unitPrice: extrasMap.get(e.extraId) ?? 0,
            })),
            ...mandatoryExtras,
          ],
        };
      },
    );
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

  // Taxi acuático (siempre) + tasa de muelle Isabela (solo si la ruta la
  // incluye, según nacionalidad de cada pasajero). Se calcula server-side,
  // el cliente no puede alterarlo.
  private async resolveMandatoryExtras(
    dto: CreateTicketDto,
  ): Promise<MandatoryFeeExtra[][]> {
    const legIslandCodes = [
      await this.schedulesService.findRouteIslandCodes(dto.outboundSchedule),
      dto.returnSchedule
        ? await this.schedulesService.findRouteIslandCodes(dto.returnSchedule)
        : null,
    ].filter((leg): leg is { originCode: string; destinationCode: string } =>
      Boolean(leg),
    );

    const legsCount = legIslandCodes.length;
    const isabelaLegsCount = legIslandCodes.filter(
      (leg) =>
        leg.originCode === ISABELA_CODE || leg.destinationCode === ISABELA_CODE,
    ).length;

    const waterTaxiExtra =
      await this.fareExtrasService.findByCode(WATER_TAXI_CODE);
    if (!waterTaxiExtra) {
      throw new DomainException(
        `Fare extra ${WATER_TAXI_CODE} not found — check seed data`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    let isabelaExtra: { id: string } | null = null;
    if (isabelaLegsCount > 0) {
      isabelaExtra = await this.fareExtrasService.findByCode(
        ISABELA_PIER_FEE_CODE,
      );
      if (!isabelaExtra) {
        throw new DomainException(
          `Fare extra ${ISABELA_PIER_FEE_CODE} not found — check seed data`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    return dto.passenger.map((p) => {
      const mandatoryExtras: MandatoryFeeExtra[] = [
        {
          extraId: waterTaxiExtra.id,
          quantity: legsCount,
          unitPrice: waterTaxiExtra.price.toNumber(),
        },
      ];

      if (isabelaExtra) {
        const isNational = p.country === NATIONAL_COUNTRY_CODE;
        mandatoryExtras.push({
          extraId: isabelaExtra.id,
          quantity: isabelaLegsCount,
          unitPrice: isNational ? ISABELA_FEE_NATIONAL : ISABELA_FEE_FOREIGN,
        });
      }

      return mandatoryExtras;
    });
  }
}
