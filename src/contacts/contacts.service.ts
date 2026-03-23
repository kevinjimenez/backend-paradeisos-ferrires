import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
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
      this.logger.error('Error creating contact', error);
      throw new InternalServerErrorException('Failed to create contact');
    }
  }
}
