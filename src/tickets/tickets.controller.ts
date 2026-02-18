import { ApiResponseDto } from './../common/dtos/api-response.dto';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import express from 'express';
import { ApiResponse } from './../common/interfaces/api-response.interface';
import { Prisma } from './../databases/generated/prisma/client';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateTicketResponse } from './interfaces/create-ticket-response.interface';
import { TicketResponse } from './interfaces/ticket-response.interface';
import { TicketsService } from './tickets.service';
import {
  CONTENT_DISPOSITION,
  CONTENT_TYPE,
} from './constants/response.constants';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(
    @Body() createTicketDto: CreateTicketDto,
  ): Promise<ApiResponse<CreateTicketResponse>> {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  findAll(): Promise<ApiResponse<Prisma.ticketsModel[]>> {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<TicketResponse>> {
    return this.ticketsService.findOne(id);
  }

  @Get(':id/pdf')
  async generateTicket(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: express.Response,
  ): Promise<void> {
    const pdf = await this.ticketsService.generateTicketPdf(id);

    res.set({
      'Content-Type': CONTENT_TYPE,
      'Content-Disposition': CONTENT_DISPOSITION,
    });
    res.send(pdf);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ): Promise<ApiResponseDto<Prisma.ticketsModel>> {
    return this.ticketsService.update(id, updateTicketDto);
  }
}
