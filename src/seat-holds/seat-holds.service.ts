import { Injectable } from '@nestjs/common';
import { DatabasesService } from './../databases/databases.service';
import { CreateSeatHoldDto } from './dto/create-seat-hold.dto';
import { UpdateSeatHoldDto } from './dto/update-seat-hold.dto';
import { FindReservedSeatsDto } from './dto/find-reserved-seats.dto';

@Injectable()
export class SeatHoldsService {
  constructor(private databasesService: DatabasesService) {}

  create(createSeatHoldDto: CreateSeatHoldDto) {
    return 'This action adds a new seatHold';
  }

  findAll() {
    return this.databasesService.seat_holds.findMany();
  }

  findOne(id: string) {
    return `This action returns a #${id} seatHold`;
  }

  findReservedSeats(query: FindReservedSeatsDto) {
    const scheduleIds = [query.outbound, query.return].filter(
      (id): id is string => Boolean(id),
    );

    return this.databasesService.seat_holds.findMany({
      include: {
        schedules: {
          include: {
            ferries: true,
            routes: true,
          },
        },
      },
      where: {
        id: {
          in: scheduleIds,
        },
        status: 'held',
      },
    });
  }

  update(id: number, updateSeatHoldDto: UpdateSeatHoldDto) {
    return `This action updates a #${id} seatHold`;
  }

  remove(id: number) {
    return `This action removes a #${id} seatHold`;
  }
}
