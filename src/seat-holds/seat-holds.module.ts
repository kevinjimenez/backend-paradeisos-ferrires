import { Module } from '@nestjs/common';
import { SeatHoldsService } from './seat-holds.service';
import { SeatHoldsController } from './seat-holds.controller';

@Module({
  controllers: [SeatHoldsController],
  providers: [SeatHoldsService],
})
export class SeatHoldsModule {}
