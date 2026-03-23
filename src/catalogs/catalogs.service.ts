import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from 'src/databases/generated/prisma/client';
import { CatalogsRepository } from './catalogs.repository';
import { CatalogResponse } from './interfaces/catalog-response.interface';

@Injectable()
export class CatalogsService {
  private readonly logger = new Logger(CatalogsService.name);

  constructor(private readonly catalogsRepository: CatalogsRepository) {}

  async findAll(): Promise<Prisma.catalogsModel[]> {
    const catalogs = await this.catalogsRepository.findAll();
    return catalogs;
  }

  async findByCategory(category: string): Promise<CatalogResponse[]> {
    const catalogs = await this.catalogsRepository.findByCategory(category);
    return catalogs;
  }
}
