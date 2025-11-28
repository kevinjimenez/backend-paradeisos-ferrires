import { Injectable } from '@nestjs/common';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { DatabasesService } from 'src/databases/databases.service';

@Injectable()
export class SeatsService {
  constructor(private databasesService: DatabasesService) {}

  create(createSeatDto: CreateSeatDto) {
    return 'This action adds a new seat';
  }

  findAll() {
    return this.databasesService.seats.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} seat`;
  }

  update(id: number, updateSeatDto: UpdateSeatDto) {
    return `This action updates a #${id} seat`;
  }

  remove(id: number) {
    return `This action removes a #${id} seat`;
  }
}
