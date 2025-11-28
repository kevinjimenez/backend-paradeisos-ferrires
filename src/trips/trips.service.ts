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

  findAll() {
    return this.databasesService.trips.findMany({
      include: {
        schedules: true,
        routes: {
          include: {
            origin_ports: true,
            destination_ports: true,
          },
        },
        ferries: true,
      },
    });
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
