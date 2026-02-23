import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { envs } from './../common/config/envs';
import { ApiResponse } from './../common/interfaces/api-response.interface';
import { DatabasesService } from './../databases/databases.service';
import { CreateBookingCommand } from './commands/create-booking.command';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingResponse } from './interfaces/booking-response.interface';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private readonly databasesService: DatabasesService,
    private readonly createBookingCommand: CreateBookingCommand,
  ) {}

  async create(
    createBookingDto: CreateBookingDto,
  ): Promise<ApiResponse<BookingResponse>> {
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

      return { data: newBooking };
    } catch (error) {
      this.logger.error('Error creating booking', error);
      throw new InternalServerErrorException('Failed to create booking');
    }
  }
}
