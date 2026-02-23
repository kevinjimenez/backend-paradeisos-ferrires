import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { SeatHoldsModule } from './../seat-holds/seat-holds.module';
import { SchedulesModule } from './../schedules/schedules.module';
import { SeatHoldsHistoryModule } from './../seat-holds-history/seat-holds-history.module';
import { CreateSeatHoldCommand } from './commands/create-seat-hold.command';
import { CreateBookingCommand } from './commands/create-booking.command';

@Module({
  imports: [SeatHoldsModule, SchedulesModule, SeatHoldsHistoryModule],
  controllers: [BookingController],
  providers: [BookingService, CreateSeatHoldCommand, CreateBookingCommand],
  exports: [BookingService],
})
export class BookingModule {}
