import { Module } from '@nestjs/common';
import { SeatHoldsHistoryService } from './seat-holds-history.service';
import { SeatHoldsHistoryController } from './seat-holds-history.controller';
import { SeatHoldsHistoryRepository } from './seat-holds-history.repository';

@Module({
  controllers: [SeatHoldsHistoryController],
  providers: [SeatHoldsHistoryService, SeatHoldsHistoryRepository],
  exports: [SeatHoldsHistoryService, SeatHoldsHistoryRepository],
})
export class SeatHoldsHistoryModule {}
