import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SeatHoldsHistoryService } from './seat-holds-history.service';
import { CreateSeatHoldsHistoryDto } from './dto/create-seat-holds-history.dto';
import { UpdateSeatHoldsHistoryDto } from './dto/update-seat-holds-history.dto';

@Controller('seat-holds-history')
export class SeatHoldsHistoryController {
  constructor(
    private readonly seatHoldsHistoryService: SeatHoldsHistoryService,
  ) {}

  @Post()
  create(@Body() createSeatHoldsHistoryDto: CreateSeatHoldsHistoryDto) {
    return this.seatHoldsHistoryService.create(createSeatHoldsHistoryDto);
  }

  @Get()
  findAll() {
    return this.seatHoldsHistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log({ id });
    return this.seatHoldsHistoryService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSeatHoldsHistoryDto: UpdateSeatHoldsHistoryDto,
  ) {
    return this.seatHoldsHistoryService.update(+id, updateSeatHoldsHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.seatHoldsHistoryService.remove(+id);
  }
}
