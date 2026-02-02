import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiResponse } from './../common/interfaces/api-response.interface';
import { SeatHoldsHistoryResponse } from './interfaces/seat-holds-history-response';
import { SeatHoldsHistoryService } from './seat-holds-history.service';

@Controller('seat-holds-history')
export class SeatHoldsHistoryController {
  constructor(
    private readonly seatHoldsHistoryService: SeatHoldsHistoryService,
  ) {}

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<SeatHoldsHistoryResponse>> {
    return this.seatHoldsHistoryService.findOne(id);
  }
}
