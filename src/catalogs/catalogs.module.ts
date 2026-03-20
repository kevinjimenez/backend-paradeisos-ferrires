import { Module } from '@nestjs/common';
import { CatalogsService } from './catalogs.service';
import { CatalogsController } from './catalogs.controller';
import { CatalogsRepository } from './catalogs.repository';

@Module({
  controllers: [CatalogsController],
  providers: [CatalogsService, CatalogsRepository],
})
export class CatalogsModule {}
