import { Injectable } from '@nestjs/common';
import { CreatePortDto } from './dto/create-port.dto';
import { UpdatePortDto } from './dto/update-port.dto';
import { DatabasesService } from 'src/databases/databases.service';

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
