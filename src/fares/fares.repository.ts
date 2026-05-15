import { Injectable } from '@nestjs/common';
import { DatabasesService } from 'src/databases/databases.service';
import { BaseRepository } from '../common/base/base.repository';
import { Prisma } from '../databases/generated/prisma/client';

@Injectable()
export class FaresRepository extends BaseRepository<Prisma.faresModel> {
  constructor(private readonly databasesService: DatabasesService) {
    super();
  }

  protected get modelName(): string {
    return 'fares';
  }

  protected get db() {
    return this.databasesService;
  }

  findAllWithFilters(is_active: boolean = true) {
    return this.db.fares.findMany({ where: { is_active } });
  }

  findById(id: string) {
    return this.db.fares.findUnique({ where: { id } });
  }
}
