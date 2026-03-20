import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponse } from './interfaces/booking-response.interface';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingsService) {}

  @Post()
  create(
    @Body() createBookingDto: CreateBookingDto,
  ): Promise<ApiResponse<BookingResponse>> {
    return this.bookingService.create(createBookingDto);
  }
}
