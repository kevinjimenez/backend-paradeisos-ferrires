import { Injectable } from '@nestjs/common';
import { DatabasesService } from 'src/databases/databases.service';

@Injectable()
export class FareExtrasRepository {
  constructor(private readonly db: DatabasesService) {}

  findAll() {
    return this.db.fare_extras.findMany({ where: { is_active: true } });
  }

  findById(id: string) {
    return this.db.fare_extras.findUnique({ where: { id } });
  }
}