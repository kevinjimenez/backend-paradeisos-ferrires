import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DatabasesService } from 'src/databases/databases.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactDtoMapper } from './mappers/contact-dto.mapper';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { Prisma } from 'src/databases/generated/prisma/client';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);

  constructor(private readonly databasesService: DatabasesService) {}

  async create(
    createContactDto: CreateContactDto,
  ): Promise<ApiResponse<Prisma.contactsCreateInput>> {
    try {
      const contactToCreate = ContactDtoMapper.toPrismaCreate(createContactDto);

      const newContact = await this.databasesService.contacts.upsert({
        where: {
          email: contactToCreate.email,
          document_number: contactToCreate.document_number,
        },
        create: contactToCreate,
        update: contactToCreate,
      });

      return {
        data: newContact,
      };
    } catch (error) {
      this.logger.error('Error creating contact', error);
      throw new InternalServerErrorException('Failed to create contact');
    }
  }
}
