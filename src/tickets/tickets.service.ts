import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ResourceNotFoundException } from 'src/common/exceptions/not-found.exception';
import { handleServiceError } from 'src/common/utils/service-error.handler';
import { PdfService } from './../common/services/pdf/pdf.service';
import { DatabasesService } from './../databases/databases.service';
import { Prisma } from './../databases/generated/prisma/client';
import { TicketQueryBuilder } from './builders/ticket-query.builder';
import { CreateTicketCommand } from './commands/create-ticket.command';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketPdfGenerator } from './generators/ticket-pdf.generator';
import { CreateTicketResponse } from './interfaces/create-ticket-response.interface';
import { TicketResponse } from './interfaces/ticket-response.interface';
import { TicketMapper } from './mappers/ticket.mapper';
import { TicketsRepository } from './tickets.repository';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly databasesService: DatabasesService,
    private readonly ticketsRepository: TicketsRepository,
    private readonly createTicketCommand: CreateTicketCommand,
    private readonly ticketGenerator: TicketPdfGenerator,
    private readonly pdfService: PdfService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    createTicketDto: CreateTicketDto,
  ): Promise<CreateTicketResponse> {
    try {
      const newTicket = await this.databasesService.$transaction(async (tx) => {
        return this.createTicketCommand.execute(createTicketDto, tx);
      });

      return newTicket;
    } catch (error) {
      return handleServiceError(error, this.logger, 'Error creating ticket');
    }
  }

  async findOne(id: string): Promise<TicketResponse> {
    const selectConfig = new TicketQueryBuilder().withAllRelations().build();

    const ticket = await this.ticketsRepository.findOneWithRelations(
      id,
      selectConfig,
    );

    if (!ticket) {
      throw new ResourceNotFoundException('Ticket', id);
    }

    return ticket as unknown as TicketResponse;
  }

  async findAll(): Promise<Prisma.ticketsModel[]> {
    const tickets = await this.ticketsRepository.findAll();
    return tickets;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto) {
    const ticketToUpdate = await this.findOne(id);

    const ticketUpdated = await this.ticketsRepository.updateTicket(
      ticketToUpdate.id,
      updateTicketDto,
    );

    return ticketUpdated;
  }

  async generateTicketPdf(id: string) {
    const ticket = await this.findOne(id);
    const ticketData = TicketMapper.toTicketResponse(ticket);
    return this.pdfService.generate(this.ticketGenerator, ticketData);
  }
}
