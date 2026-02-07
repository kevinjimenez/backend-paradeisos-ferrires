import { CreatePaymentDto } from '../dto/create-payment.dto';

export class PaymentMapper {
  static toPrismaCreate(dto: CreatePaymentDto) {
    return {
      amount: dto.amount,
      ticket_id: dto.ticketId,
      payment_method: dto.paymentMethod,
      payment_provider: dto.paymentProvider,
    };
  }
}
