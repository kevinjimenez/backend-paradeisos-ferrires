import { PaymentMethod } from './../../databases/generated/prisma/enums';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsUUID()
  ticketId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod = PaymentMethod.credit_card;

  @IsOptional()
  @IsString()
  paymentProvider: string = 'payphone';
}
