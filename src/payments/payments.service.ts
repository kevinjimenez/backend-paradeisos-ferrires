import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from 'src/common/exceptions/not-found.exception';
import { Prisma, TicketsStatus } from 'src/databases/generated/prisma/client';
import { PaymentStatus } from './../databases/generated/prisma/enums';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentMapper } from './mappers/payment.mapper';
import { PaymentsRepository } from './payments.repository';
import { TicketUpdatedEvent } from '../tickets/events/ticket-updated.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVENTS } from '../common/constants/events.constants';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    createPaymentDto: CreatePaymentDto,
  ): Promise<Prisma.paymentsModel> {
    const data = PaymentMapper.toPrismaCreate(createPaymentDto);
    const payment = await this.paymentsRepository.create(data);

    return payment;
  }

  async findAll(): Promise<Prisma.paymentsModel[]> {
    const payments = await this.paymentsRepository.findAllWithTickets();

    return payments;
  }

  async findOne(id: string) {
    const payment = await this.paymentsRepository.findByIdWithTicket(id);

    if (!payment) {
      throw new ResourceNotFoundException('Payment', id);
    }

    return payment;
  }

  async update(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Prisma.paymentsModel> {
    const paymentUpdated = (await this.findOne(id)) as unknown as {
      ticket_id: string;
      tickets: {
        contacts: {
          email: string;
        };
      };
    };

    const data = PaymentMapper.toPrismaUpdate(updatePaymentDto);
    const payment = await this.paymentsRepository.update(id, data);

    this.eventEmitter.emit(
      EVENTS.TICKET_UPDATED,
      new TicketUpdatedEvent(
        paymentUpdated.ticket_id,
        TicketsStatus.confirmed,
        paymentUpdated.tickets.contacts.email,
      ),
    );

    return payment;
  }

  async remove(id: string): Promise<Prisma.paymentsModel> {
    await this.findOne(id);

    const payment = await this.paymentsRepository.delete(id);

    return payment;
  }

  async findByTicketId(ticketId: string): Promise<Prisma.paymentsModel[]> {
    const payments = await this.paymentsRepository.findByTicketId(ticketId);

    return payments;
  }

  async updateStatus(
    id: string,
    status: PaymentStatus,
  ): Promise<Prisma.paymentsModel> {
    await this.findOne(id);

    const payment = await this.paymentsRepository.updateStatus(id, status);

    return payment;
  }
}
