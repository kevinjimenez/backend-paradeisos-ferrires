import { CreatePassengerDto } from '../dto/create-passenger.dto';

export class PassengerMapper {
  static toPrismaCreate(dto: CreatePassengerDto) {
    return {
      first_name: dto.firstName,
      last_name: dto.lastName,
      document_number: dto.documentNumber,
      document_type: dto.documentType,
      email: dto.email,
      phone: dto.phone,
      unit_price: dto.unitPrice,
      is_primary: dto.isPrimary,
      checked_in_outbound: dto.checkedInOutbound,
      checked_in_return: dto.checkedInReturn,
      ticket_id: dto.ticket,
    };
  }
}
