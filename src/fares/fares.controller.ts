import { Controller, Get, Query } from '@nestjs/common';
import { FaresService } from './fares.service';
import { QueryParamsDto } from '../common/dtos/query-params.dto';

@Controller('fares')
export class FaresController {
  constructor(private readonly faresService: FaresService) {}

  @Get()
  findAll(@Query() filters: QueryParamsDto) {
    return this.faresService.findAll(filters);
  }
}
