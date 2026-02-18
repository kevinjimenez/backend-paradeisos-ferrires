import { ApiResponseDto } from './../common/dtos/api-response.dto';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ApiResponse } from './../common/interfaces/api-response.interface';
import { PdfService } from './../common/services/pdf/pdf.service';
import { ContactsService } from './../contacts/contacts.service';
import { DatabasesService } from './../databases/databases.service';
import { Prisma } from './../databases/generated/prisma/client';
import { PassengersService } from './../passengers/passengers.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketPdfGenerator } from './generators/ticket-pdf.generator';
import { CreateTicketResponse } from './interfaces/create-ticket-response.interface';
import { TicketResponse } from './interfaces/ticket-response.interface';
import { TicketMapper } from './mappers/ticket.mapper';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly databasesService: DatabasesService,
    private readonly contactsService: ContactsService,
    private readonly passengersService: PassengersService,
    private readonly ticketGenerator: TicketPdfGenerator,
    private readonly pdfService: PdfService,
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

      const ticketToCreate = TicketMapper.toPrismaCreate(
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

  async findOne(id: string): Promise<ApiResponse<TicketResponse>> {
    const ticketWithRelations = {
      id: true,
      status: true,
      ticket_code: true,
      qr_code: true,
      passengers: {
        select: {
          first_name: true,
          last_name: true,
          document_number: true,
        },
      },
      outbound_schedules: {
        select: {
          departure_date: true,
          departure_time: true,
          arrival_time: true,
          routes: {
            select: {
              origin_ports: {
                select: {
                  name: true,
                  islands: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              destination_ports: {
                select: {
                  name: true,
                  islands: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          ferries: {
            select: {
              name: true,
            },
          },
        },
      },
      return_schedules: {
        select: {
          departure_date: true,
          departure_time: true,
          arrival_time: true,
          routes: {
            select: {
              origin_ports: {
                select: {
                  name: true,
                  islands: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              destination_ports: {
                select: {
                  name: true,
                  islands: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          ferries: {
            select: {
              name: true,
            },
          },
        },
      },
    };
    const ticket = await this.databasesService.tickets.findUnique({
      where: { id },
      select: ticketWithRelations,
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return { data: ticket as TicketResponse };
  }

  async findAll(): Promise<ApiResponse<Prisma.ticketsModel[]>> {
    const tickets = await this.databasesService.tickets.findMany();
    return { data: tickets };
  }

  async update(
    id: string,
    updateTicketDto: UpdateTicketDto,
  ): Promise<ApiResponseDto<Prisma.ticketsModel>> {
    const { data: ticketToUpdate } = await this.findOne(id);

    const ticketUpdated = await this.databasesService.tickets.update({
      where: { id: ticketToUpdate.id },
      data: updateTicketDto,
    });

    return {
      data: ticketUpdated,
    };
  }

  async generateTicketPdf(id: string) {
    const data = await this.findOne(id);

    const { data: ticket } = data;

    const ticketData = TicketMapper.toTicketResponse(ticket);

    return await this.pdfService.generate(this.ticketGenerator, ticketData);
  }
}
