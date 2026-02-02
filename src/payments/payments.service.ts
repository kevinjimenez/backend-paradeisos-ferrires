import { Prisma } from 'src/databases/generated/prisma/client';
import { ApiResponseDto } from './../common/dtos/api-response.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentDtoMapper } from './mappers/payment-dto.mapper';
import { DatabasesService } from '../databases/databases.service';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly databasesService: DatabasesService) {}

  async create(
    createPaymentDto: CreatePaymentDto,
  ): Promise<ApiResponseDto<Prisma.paymentsModel>> {
    const paymentToCreate = PaymentDtoMapper.toPrismaCreate(createPaymentDto);
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
