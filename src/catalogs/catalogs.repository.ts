import { DatabasesService } from './../databases/databases.service';
import { BaseRepository } from 'src/common/base/base.repository';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/databases/generated/prisma/client';
import { PrismaTransaction } from 'src/common/types/prisma-transaction.type';

@Injectable()
export class CatalogsRepository extends BaseRepository<Prisma.catalogsModel> {
  constructor(private readonly databasesService: DatabasesService) {
    super();
  }

  protected get modelName(): string {
    return 'catalogs';
  }
  protected get db(): PrismaTransaction {
    return this.databasesService;
  }

  // public findByCategory(category: string) {
  //   return this.db.catalogs.findMany({
  //     where: {
  //       category,
  //       is_active: true,
  //     },
  //     select: {
  //       id: true,
  //       code: true,
  //       description: true,
  //     },
  //   });
  // }
}
