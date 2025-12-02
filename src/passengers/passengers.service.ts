import { Injectable } from '@nestjs/common';
import { DatabasesService } from './../databases/databases.service';
import { CreatePassengerDto } from './dto/create-passenger.dto';
import { UpdatePassengerDto } from './dto/update-passenger.dto';

@Injectable()
export class PassengersService {
  constructor(private databasesService: DatabasesService) {}

  create(createPassengerDto: CreatePassengerDto) {
    return 'This action adds a new passenger';
  }

  findAll() {
    return this.databasesService.passengers.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} passenger`;
  }

  update(id: number, updatePassengerDto: UpdatePassengerDto) {
    return `This action updates a #${id} passenger`;
  }

  remove(id: number) {
    return `This action removes a #${id} passenger`;
  }
}
