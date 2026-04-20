import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingController } from './bookings.controller';
import { SeatHoldsModule } from '../seat-holds/seat-holds.module';
import { SchedulesModule } from '../schedules/schedules.module';
import { SeatHoldsHistoryModule } from '../seat-holds-history/seat-holds-history.module';
import { CreateSeatHoldCommand } from './commands/create-seat-hold.command';
import { CreateBookingCommand } from './commands/create-booking.command';

@Module({
  imports: [SeatHoldsModule, SchedulesModule, SeatHoldsHistoryModule],
  controllers: [BookingController],
  providers: [BookingsService, CreateSeatHoldCommand, CreateBookingCommand],
  exports: [BookingsService],
})
export class BookingsModule {}
