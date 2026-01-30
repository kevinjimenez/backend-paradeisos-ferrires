import { Module } from '@nestjs/common';
import { SeatHoldsHistoryService } from './seat-holds-history.service';
import { SeatHoldsHistoryController } from './seat-holds-history.controller';

@Module({
  controllers: [SeatHoldsHistoryController],
  providers: [SeatHoldsHistoryService],
})
export class SeatHoldsHistoryModule {}
