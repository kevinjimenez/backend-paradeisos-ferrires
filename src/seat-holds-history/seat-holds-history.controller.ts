import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { SeatHoldsHistoryService } from './seat-holds-history.service';

@Controller('seat-holds-history')
export class SeatHoldsHistoryController {
  constructor(
    private readonly seatHoldsHistoryService: SeatHoldsHistoryService,
  ) {}

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.seatHoldsHistoryService.findOne(id);
  }
}
