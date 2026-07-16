import { CreateContactDto } from '../dto/create-contact.dto';

export class ContactMapper {
  static toPrismaCreate(dto: CreateContactDto) {
    return {
      first_name: dto.firstName ?? null,
      last_name: dto.lastName ?? null,
      legal_name: dto.legalName ?? null,
      contact_type: dto.contactType,
      country: dto.country,
      city: dto.city ?? null,
      document_number: dto.documentNumber,
      document_type: dto.documentType,
      email: dto.email,
      phone: dto.phone,
    };
  }
}
