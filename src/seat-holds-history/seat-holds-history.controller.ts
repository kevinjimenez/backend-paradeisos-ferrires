import { Controller, Get, Param } from '@nestjs/common';
import { SeatHoldsHistoryService } from './seat-holds-history.service';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';

@Controller('seat-holds-history')
export class SeatHoldsHistoryController {
  constructor(
    private readonly seatHoldsHistoryService: SeatHoldsHistoryService,
  ) {}

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ApiResponse<any>> {
    return this.seatHoldsHistoryService.findOne(id);
  }
}
