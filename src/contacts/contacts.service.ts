import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ApiResponse } from './../common/interfaces/api-response.interface';
import { DatabasesService } from './../databases/databases.service';
import { Prisma } from './../databases/generated/prisma/client';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactMapper } from './mappers/contact.mapper';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(private readonly databasesService: DatabasesService) {}

  async create(
    createContactDto: CreateContactDto,
  ): Promise<ApiResponse<Prisma.contactsCreateInput>> {
    try {
      const contactToCreate = ContactMapper.toPrismaCreate(createContactDto);

      const newContact = await this.databasesService.contacts.upsert({
        where: {
          // email: contactToCreate.email,
          document_number: contactToCreate.document_number,
        },
        create: contactToCreate,
        update: contactToCreate,
      });

      console.log('New contact created or updated:', newContact);

      return {
        data: newContact,
      };
    } catch (error) {
      this.logger.error('Error creating contact', error);
      throw new InternalServerErrorException('Failed to create contact');
    }
  }
}
