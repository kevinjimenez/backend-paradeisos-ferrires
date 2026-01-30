import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateSeatHoldDto } from './dto/create-seat-hold.dto';
import { UpdateSeatHoldDto } from './dto/update-seat-hold.dto';
import { SeatHoldsService } from './seat-holds.service';
import { FindReservedSeatsDto } from './dto/find-reserved-seats.dto';

@Controller('seat-holds')
export class SeatHoldsController {
  constructor(private readonly seatHoldsService: SeatHoldsService) {}

  @Post()
  create(@Body() createSeatHoldDto: CreateSeatHoldDto) {
    return this.seatHoldsService.create(createSeatHoldDto);
  }

  @Get()
  findAll() {
    return this.seatHoldsService.findAll();
  }

  @Get('reserved-seats')
  findReservedSeats(@Query() query: FindReservedSeatsDto) {
    console.log(query.outbound);
    console.log(query.return);
    return this.seatHoldsService.findReservedSeats(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seatHoldsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSeatHoldDto: UpdateSeatHoldDto,
  ) {
    return this.seatHoldsService.update(+id, updateSeatHoldDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.seatHoldsService.remove(+id);
  }
}
