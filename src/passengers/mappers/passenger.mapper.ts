import { PassengerInputDto } from '../dto/create-passenger.dto';

export class PassengerMapper {
  static toPrismaCreate(dto: PassengerInputDto) {
    return {
      first_name: dto.firstName,
      last_name: dto.lastName,
      document_number: dto.documentNumber,
      document_type: dto.documentType,
      email: dto.email,
      phone: dto.phone,
      unit_price: dto.unitPrice ?? 0,
      outbound_fare_id: dto.outboundFareId,
      return_fare_id: dto.returnFareId ?? null,
      is_primary: dto.isPrimary,
      checked_in_outbound: dto.checkedInOutbound,
      checked_in_return: dto.checkedInReturn,
      ticket_id: dto.ticket,
    };
  }
}
