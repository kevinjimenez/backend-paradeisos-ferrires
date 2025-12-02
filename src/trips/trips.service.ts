import { Injectable } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { DatabasesService } from 'src/databases/databases.service';

@Injectable()
export class TripsService {
  constructor(private databasesService: DatabasesService) {}

  create(createTripDto: CreateTripDto) {
    return 'This action adds a new trip';
  }

  async findAll() {
    const trips = await this.databasesService.trips.findMany({
      include: {
        routes: {
          include: {
            origin_ports: true,
            destination_ports: true,
          },
        },
        ferries: {
          include: {
            seat_configurations: {
              include: {
                seats: true,
              },
            },
          },
        },
      },
    });

    const newTrips = trips.map((trip) => {
      let totalSeats = 0;
      const ferries = trip.ferries;
      if (ferries) {
        totalSeats = ferries.seat_configurations.reduce(
          (acc, cfg) => acc + cfg.seats.length,
          0,
        );
      }

      return {
        ...trip,
        totalSeats,
      };
    });
    // const totalSeats = trip.ferries.seat_configurations.reduce(
    //   (acc, cfg) => acc + cfg.seats.length,
    //   0,
    // );
    return newTrips;
  }

  findOne(id: number) {
    return `This action returns a #${id} trip`;
  }

  update(id: number, updateTripDto: UpdateTripDto) {
    return `This action updates a #${id} trip`;
  }

  remove(id: number) {
    return `This action removes a #${id} trip`;
  }
}
