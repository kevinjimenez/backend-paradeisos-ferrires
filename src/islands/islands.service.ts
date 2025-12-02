import { Injectable } from '@nestjs/common';
import { DatabasesService } from './../databases/databases.service';
import { CreateIslandDto } from './dto/create-island.dto';
import { UpdateIslandDto } from './dto/update-island.dto';

@Injectable()
export class IslandsService {
  constructor(private databasesService: DatabasesService) {}

  create(createIslandDto: CreateIslandDto) {
    return 'This action adds a new island';
  }

  findAll() {
    return this.databasesService.islands.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} island`;
  }

  update(id: number, updateIslandDto: UpdateIslandDto) {
    return `This action updates a #${id} island`;
  }

  remove(id: number) {
    return `This action removes a #${id} island`;
  }
}
