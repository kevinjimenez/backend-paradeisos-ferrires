import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { Prisma } from 'src/databases/generated/prisma/client';
import { ContactsService } from './../contacts/contacts.service';
import { DatabasesService } from './../databases/databases.service';
import { PassengersService } from './../passengers/passengers.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateTicketResponse } from './interfaces/create-ticket-response.interface';
import { TicketDtoMapper } from './mappers/ticket-dto.mapper';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private databasesService: DatabasesService,
    private contactsService: ContactsService,
    private passengersService: PassengersService,
  ) {}

  async create(
    createTicketDto: CreateTicketDto,
  ): Promise<ApiResponse<CreateTicketResponse>> {
    try {
      //1: create contact
      const { data: newContact } = await this.contactsService.create(
        createTicketDto.contact,
      );

      if (!newContact.id) {
        throw new Error('Contact not created');
      }

      //2: create ticket
      const ticketToCreate = TicketDtoMapper.toPrismaCreate(
        createTicketDto,
        newContact.id,
      );

      const newTicket = await this.databasesService.tickets.create({
        data: ticketToCreate,
      });

      //3: create passenger
      await Promise.all(
        createTicketDto.passenger.map((passengerDto) =>
          this.passengersService.create({
            ...passengerDto,
            ticket: newTicket.id,
          }),
        ),
      );

      return {
        data: {
          id: newTicket.id,
        },
      };
    } catch (error) {
      this.logger.error('Error creating ticket', error);
      throw new InternalServerErrorException('Failed to create ticket');
    }
  }

  async findOne(id: string): Promise<ApiResponse<Prisma.ticketsModel>> {
    const ticket = await this.databasesService.tickets.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return { data: ticket };
  }
}
