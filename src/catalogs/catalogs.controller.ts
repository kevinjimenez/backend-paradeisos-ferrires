import { Controller, Get, Query } from '@nestjs/common';
import { CatalogsService } from './catalogs.service';

@Controller('catalogs')
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  @Get()
  findAll() {
    return this.catalogsService.findAll();
  }

  @Get('by-category')
  findByCategory(@Query() query: { category: string }) {
    const { category } = query;
    return this.catalogsService.findByCategory(category);
  }
}
