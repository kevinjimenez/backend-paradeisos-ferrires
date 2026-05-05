import { Injectable } from '@nestjs/common';
import { DatabasesService } from 'src/databases/databases.service';

@Injectable()
export class FaresRepository {
  constructor(private readonly db: DatabasesService) {}

  findAll() {
    return this.db.fares.findMany({ where: { is_active: true } });
  }

  findById(id: string) {
    return this.db.fares.findUnique({ where: { id } });
  }
}
