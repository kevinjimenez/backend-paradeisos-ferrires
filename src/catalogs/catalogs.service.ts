import { Injectable, Logger } from '@nestjs/common';
import { CatalogsRepository } from './catalogs.repository';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { Prisma } from 'src/databases/generated/prisma/client';
import { CatalogResponse } from './interfaces/catalog-response.interface';

@Injectable()
export class CatalogsService {
  private readonly logger = new Logger(CatalogsService.name);

  constructor(private readonly catalogsRepository: CatalogsRepository) {}

  async findAll(): Promise<ApiResponse<Prisma.catalogsModel[]>> {
    const catalogs = await this.catalogsRepository.findAll();
    return { data: catalogs };
  }

  async findByCategory(
    category: string,
  ): Promise<ApiResponse<CatalogResponse[]>> {
    const catalogs = await this.catalogsRepository.findByCategory(category);
    return { data: catalogs };
  }
}
