import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'src/databases/generated/prisma/client';
import { ApiResponse } from './../common/interfaces/api-response.interface';
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
  ): Promise<ApiResponse<Prisma.paymentsModel>> {
    const data = PaymentMapper.toPrismaCreate(createPaymentDto);
    const payment = await this.paymentsRepository.create(data);

    return { data: payment };
  }

  async findAll(): Promise<ApiResponse<Prisma.paymentsModel[]>> {
    const payments = await this.paymentsRepository.findAllWithTickets();

    return { data: payments };
  }

  async findOne(id: string): Promise<ApiResponse<Prisma.paymentsModel>> {
    const payment = await this.paymentsRepository.findByIdWithTicket(id);

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return { data: payment };
  }

  async update(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<ApiResponse<Prisma.paymentsModel>> {
    await this.findOne(id);

    const data = PaymentMapper.toPrismaUpdate(updatePaymentDto);
    const payment = await this.paymentsRepository.update(id, data);

    return { data: payment };
  }

  async remove(id: string): Promise<ApiResponse<Prisma.paymentsModel>> {
    await this.findOne(id);

    const payment = await this.paymentsRepository.delete(id);

    return { data: payment };
  }

  async findByTicketId(
    ticketId: string,
  ): Promise<ApiResponse<Prisma.paymentsModel[]>> {
    const payments = await this.paymentsRepository.findByTicketId(ticketId);

    return { data: payments };
  }

  async updateStatus(
    id: string,
    status: PaymentStatus,
  ): Promise<ApiResponse<Prisma.paymentsModel>> {
    await this.findOne(id);

    const payment = await this.paymentsRepository.updateStatus(id, status);

    return { data: payment };
  }
}
