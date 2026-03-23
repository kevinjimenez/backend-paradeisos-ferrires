import { Injectable, Logger } from '@nestjs/common';
import { handleServiceError } from 'src/common/utils/service-error.handler';
import { Prisma } from './../databases/generated/prisma/client';
import { ContactsRepository } from './contacts.repository';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactMapper } from './mappers/contact.mapper';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(private readonly contactsRepository: ContactsRepository) {}

  async create(
    createContactDto: CreateContactDto,
  ): Promise<Prisma.contactsModel> {
    try {
      const contactToCreate = ContactMapper.toPrismaCreate(createContactDto);
      const newContact =
        await this.contactsRepository.upsertByDocument(contactToCreate);

      return newContact;
    } catch (error) {
      return handleServiceError(error, this.logger, 'Failed to create contact');
    }
  }
}
