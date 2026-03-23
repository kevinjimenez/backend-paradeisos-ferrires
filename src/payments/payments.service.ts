import { Injectable } from '@nestjs/common';
import { ResourceNotFoundException } from 'src/common/exceptions/not-found.exception';
import { Prisma } from 'src/databases/generated/prisma/client';
import { PaymentStatus } from './../databases/generated/prisma/enums';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentMapper } from './mappers/payment.mapper';
import { PaymentsRepository } from './payments.repository';

@Injectable()
export class PaymentsService {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

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

  async findOne(id: string): Promise<Prisma.paymentsModel> {
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
    await this.findOne(id);

    const data = PaymentMapper.toPrismaUpdate(updatePaymentDto);
    const payment = await this.paymentsRepository.update(id, data);

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
