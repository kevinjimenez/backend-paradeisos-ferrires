import { Injectable } from '@nestjs/common';
import { CreateFerryDto } from './dto/create-ferry.dto';
import { UpdateFerryDto } from './dto/update-ferry.dto';

@Injectable()
export class FerriesService {
  create(createFerryDto: CreateFerryDto) {
    return 'This action adds a new ferry';
  }

  findAll() {
    return `This action returns all ferries`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ferry`;
  }

  update(id: number, updateFerryDto: UpdateFerryDto) {
    return `This action updates a #${id} ferry`;
  }

  remove(id: number) {
    return `This action removes a #${id} ferry`;
  }
}
