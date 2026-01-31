import { CreateContactDto } from '../dto/create-contact.dto';

export class ContactDtoMapper {
  static toPrismaCreate(dto: CreateContactDto) {
    return {
      first_name: dto.firstName,
      last_name: dto.lastName,
      document_number: dto.documentNumber,
      document_type: dto.documentType,
      email: dto.email,
      phone: dto.phone,
    };
  }
}
