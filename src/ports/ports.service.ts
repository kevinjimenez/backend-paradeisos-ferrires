import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabasesService } from './../databases/databases.service';
import { CreatePortDto } from './dto/create-port.dto';
import { UpdatePortDto } from './dto/update-port.dto';
import { console } from 'inspector';

@Injectable()
export class PortsService {
  constructor(private databasesService: DatabasesService) {}

  create(createPortDto: CreatePortDto) {
    return 'This action adds a new port';
  }

  async findAll() {
    try {
      const data = await this.databasesService.ports.findMany({
        include: {
          islands: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      return {
        data,
        meta: {
          page: 0,
          limit: 0,
          total: 0,
          totalPages: 0,
        },
      };
    } catch (error) {
      console.log({ error });
      throw new NotFoundException('not found');
    }
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
