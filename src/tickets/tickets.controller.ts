import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { Prisma } from 'src/databases/generated/prisma/client';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateTicketResponse } from './interfaces/create-ticket-response.interface';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(
    @Body() createTicketDto: CreateTicketDto,
  ): Promise<ApiResponse<CreateTicketResponse>> {
    return this.ticketsService.create(createTicketDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ApiResponse<Prisma.ticketsModel>> {
    return this.ticketsService.findOne(id);
  }
}
