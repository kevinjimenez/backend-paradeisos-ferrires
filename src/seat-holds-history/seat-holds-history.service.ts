import { Injectable } from '@nestjs/common';
import { CreateSeatHoldsHistoryDto } from './dto/create-seat-holds-history.dto';
import { UpdateSeatHoldsHistoryDto } from './dto/update-seat-holds-history.dto';
import { DatabasesService } from 'src/databases/databases.service';

@Injectable()
export class SeatHoldsHistoryService {
  constructor(private databasesService: DatabasesService) {}

  async create(createSeatHoldsHistoryDto: CreateSeatHoldsHistoryDto) {
    const { outbound_seat_hold_id, return_seat_hold_id } =
      createSeatHoldsHistoryDto;

    return await this.databasesService.seat_holds_history.create({
      data: {
        ...(outbound_seat_hold_id && { outbound_seat_hold_id }),
        ...(return_seat_hold_id && { return_seat_hold_id }),
      },
    });
  }

  findAll() {
    return `This action returns all seatHoldsHistory`;
  }

  findOne(id: string) {
    return this.databasesService.seat_holds_history.findUnique({
      where: {
        id,
      },
      include: {
        outbound_seat_holds: {
          where: {
            status: 'held',
          },
          select: {
            status: true,
            schedules: {
              select: {
                arrival_time: true,
                departure_time: true,
                ferries: {
                  select: {
                    name: true,
                    register_code: true,
                    type: true,
                    amenities: true,
                  },
                },
                routes: {
                  select: {
                    base_price_national: true,
                  },
                },
              },
            },
          },
        },
        return_seat_holds: {
          where: {
            status: 'held',
          },
          select: {
            status: true,
            schedules: {
              select: {
                arrival_time: true,
                departure_time: true,
                ferries: {
                  select: {
                    name: true,
                    register_code: true,
                    type: true,
                    amenities: true,
                  },
                },
                routes: {
                  select: {
                    base_price_national: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  update(id: number, updateSeatHoldsHistoryDto: UpdateSeatHoldsHistoryDto) {
    return `This action updates a #${id} seatHoldsHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} seatHoldsHistory`;
  }
}
