import { Injectable } from '@nestjs/common';
import { DatabasesService } from 'src/databases/databases.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactDtoMapper } from './mappers/contact-dto.mapper';

@Injectable()
export class ContactsService {
  constructor(private readonly databasesService: DatabasesService) {}

  async create(createContactDto: CreateContactDto) {
    const contactToCreate = ContactDtoMapper.toPrismaCreate(createContactDto);

    const newContact = await this.databasesService.contacts.upsert({
      where: {
        email: contactToCreate.email,
        document_number: contactToCreate.document_number,
      },
      create: contactToCreate,
      update: contactToCreate,
    });

    return newContact;
  }
}
