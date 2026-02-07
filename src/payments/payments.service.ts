import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabasesService } from '../databases/databases.service';
import { ApiResponseDto } from './../common/dtos/api-response.dto';
import { Prisma } from './../databases/generated/prisma/client';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentMapper } from './mappers/payment.mapper';

@Injectable()
export class PaymentsService {
  constructor(private readonly databasesService: DatabasesService) {}

  async create(
    createPaymentDto: CreatePaymentDto,
  ): Promise<ApiResponseDto<Prisma.paymentsModel>> {
    const paymentToCreate = PaymentMapper.toPrismaCreate(createPaymentDto);
    const newPayment = await this.databasesService.payments.create({
      data: paymentToCreate,
    });

    return {
      data: newPayment,
    };
  }

  async findOne(id: string): Promise<ApiResponseDto<Prisma.paymentsModel>> {
    const paymentFound = await this.databasesService.payments.findUnique({
      where: { id },
    });

    if (!paymentFound) {
      throw new NotFoundException(`Payment not found id: [${id}]`);
    }

    return {
      data: paymentFound,
    };
  }

  async update(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<ApiResponseDto<Prisma.paymentsModel>> {
    const { data: paymentToUpdate } = await this.findOne(id);

    const paymentUpdated = await this.databasesService.payments.update({
      where: { id: paymentToUpdate.id },
      data: updatePaymentDto,
    });

    return {
      data: paymentUpdated,
    };
  }
}
