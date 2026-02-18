import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';

export class PaymentMapper {
  static toPrismaCreate(dto: CreatePaymentDto) {
    return {
      amount: dto.amount,
      ticket_id: dto.ticketId,
      payment_method: dto.paymentMethod,
      payment_provider: dto.paymentProvider,
    };
  }

  static toPrismaUpdate(dto: UpdatePaymentDto) {
    const update: Record<string, any> = {};

    if (dto.amount !== undefined) update.amount = dto.amount;
    if (dto.ticketId !== undefined) update.ticket_id = dto.ticketId;
    if (dto.paymentMethod !== undefined)
      update.payment_method = dto.paymentMethod;
    if (dto.paymentProvider !== undefined)
      update.payment_provider = dto.paymentProvider;
    if (dto.status !== undefined) update.status = dto.status;

    return update;
  }
}
