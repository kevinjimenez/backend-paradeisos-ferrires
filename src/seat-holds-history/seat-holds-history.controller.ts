import { Controller, Get, Param } from '@nestjs/common';
import { SeatHoldsHistoryService } from './seat-holds-history.service';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { SeatHoldsHistoryResponse } from './interfaces/seat-holds-history-response';

@Controller('seat-holds-history')
export class SeatHoldsHistoryController {
  constructor(
    private readonly seatHoldsHistoryService: SeatHoldsHistoryService,
  ) {}

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ): Promise<ApiResponse<SeatHoldsHistoryResponse>> {
    return this.seatHoldsHistoryService.findOne(id);
  }
}
