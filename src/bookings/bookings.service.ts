import { Injectable, Logger } from '@nestjs/common';
import { handleServiceError } from 'src/common/utils/service-error.handler';
import { envs } from '../common/config/envs';
import { DatabasesService } from '../databases/databases.service';
import { CreateBookingCommand } from './commands/create-booking.command';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponse } from './interfaces/booking-response.interface';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly databasesService: DatabasesService,
    private readonly createBookingCommand: CreateBookingCommand,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<BookingResponse> {
    try {
      const expiresAt = new Date();
      const minutes = expiresAt.getMinutes() + envs.holdExpirationMinutes;
      expiresAt.setMinutes(minutes);

      const newBooking = await this.databasesService.$transaction(
        async (tx) => {
          return this.createBookingCommand.execute(
            createBookingDto,
            expiresAt,
            tx,
          );
        },
      );

      return newBooking;
    } catch (error) {
      return handleServiceError(error, this.logger, 'Failed to create booking');
    }
  }
}
