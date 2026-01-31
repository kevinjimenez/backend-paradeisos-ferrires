import { generateUniqueCode } from 'src/common/utils/code-generator.util';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { envs } from 'src/common/config/envs';

export class TicketDtoMapper {
  static toPrismaCreate(dto: CreateTicketDto, contact: string) {
    const code = generateUniqueCode();
    const totalPassengers = dto.passenger.length;

    const subtotal = dto.passenger.reduce((acc, passengerDto) => {
      return acc + (passengerDto.unitPrice || 0);
    }, 0);
    // falta calcular descuentos
    const taxes = subtotal * envs.taxesValue;
    const total = subtotal + taxes + envs.serviceFeeValue;

    return {
      contacts_id: contact,
      outbound_schedule_id: dto.outboundSchedule,
      return_schedule_id: dto.returnSchedule,
      outbound_hold_id: dto.outboundHold,
      return_hold_id: dto.returnHold,
      trip_type: dto.tripType,
      ticket_code: code,
      subtotal,
      total,
      taxes,
      service_fee: envs.serviceFeeValue,
      discount: envs.discountValue,
      total_passengers: totalPassengers,
      qr_code: code,
    };
  }
}
