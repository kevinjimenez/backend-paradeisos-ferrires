import { Injectable } from '@nestjs/common';
import { DatabasesService } from './../databases/databases.service';
import { CreatePortDto } from './dto/create-port.dto';
import { UpdatePortDto } from './dto/update-port.dto';

@Injectable()
export class PortsService {
  constructor(private databasesService: DatabasesService) {}

  create(createPortDto: CreatePortDto) {
    return 'This action adds a new port';
  }

  findAll() {
    return this.databasesService.ports.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} port`;
  }

  update(id: number, updatePortDto: UpdatePortDto) {
    return `This action updates a #${id} port`;
  }

  remove(id: number) {
    return `This action removes a #${id} port`;
  }
}
