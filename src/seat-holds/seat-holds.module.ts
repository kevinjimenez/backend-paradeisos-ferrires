import { Module } from '@nestjs/common';
import { SeatHoldsRepository } from './seat-holds.repository';

@Module({
  providers: [SeatHoldsRepository],
  exports: [SeatHoldsRepository],
})
export class SeatHoldsModule {}
