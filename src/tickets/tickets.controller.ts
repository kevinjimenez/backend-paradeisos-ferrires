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
import {
  HTTP_CONTENT_TYPES,
  HTTP_HEADERS,
} from 'src/common/constants/http.constants';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TICKET_PDF_FILENAME } from './constants/ticket.constants';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketsService } from './tickets.service';
import { SkipTransform } from 'src/common/decorators/skip-transform.decorator';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsService.findOne(id);
  }

  @SkipTransform()
  @Get(':id/pdf')
  async generateTicket(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: express.Response,
  ) {
    const ticket = await this.ticketsService.generateTicketPdf(id);

    res.set({
      'Content-Type': HTTP_CONTENT_TYPES.PDF,
      'Content-Disposition':
        HTTP_HEADERS.contentDisposition(TICKET_PDF_FILENAME),
    });
    res.send(ticket);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {
    return this.ticketsService.update(id, updateTicketDto);
  }
}
