import { Injectable } from '@nestjs/common';
import { ContactsService } from './../contacts/contacts.service';
import { DatabasesService } from './../databases/databases.service';
import { PassengersService } from './../passengers/passengers.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketDtoMapper } from './mappers/ticket-dto.mapper';

@Injectable()
export class TicketsService {
  constructor(
    private databasesService: DatabasesService,
    private contactsService: ContactsService,
    private passengersService: PassengersService,
  ) {}

  async create(createTicketDto: CreateTicketDto) {
    //1: create contact
    const newContact = await this.contactsService.create(
      createTicketDto.contact,
    );

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
      id: newTicket.id,
    };
  }

  findOne(id: string) {
    return this.databasesService.tickets.findUnique({
      where: { id },
    });
  }
}
