import { Injectable } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { DatabasesService } from 'src/databases/databases.service';

@Injectable()
export class RoutesService {
  constructor(private databasesService: DatabasesService) {}

  create(createRouteDto: CreateRouteDto) {
    return 'This action adds a new route';
  }

  findAll() {
    return this.databasesService.routes.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} route`;
  }

  update(id: number, updateRouteDto: UpdateRouteDto) {
    return `This action updates a #${id} route`;
  }

  remove(id: number) {
    return `This action removes a #${id} route`;
  }
}
