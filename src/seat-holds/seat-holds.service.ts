import { Injectable } from '@nestjs/common';
import { DatabasesService } from './../databases/databases.service';
import { CreateSeatHoldDto } from './dto/create-seat-hold.dto';
import { UpdateSeatHoldDto } from './dto/update-seat-hold.dto';

@Injectable()
export class SeatHoldsService {
  constructor(private databasesService: DatabasesService) {}

  create(createSeatHoldDto: CreateSeatHoldDto) {
    return 'This action adds a new seatHold';
  }

  findAll() {
    return this.databasesService.seat_holds.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} seatHold`;
  }

  update(id: number, updateSeatHoldDto: UpdateSeatHoldDto) {
    return `This action updates a #${id} seatHold`;
  }

  remove(id: number) {
    return `This action removes a #${id} seatHold`;
  }
}
