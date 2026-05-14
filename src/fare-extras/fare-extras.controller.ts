import { Controller, Get, Query } from '@nestjs/common';
import { FareExtrasService } from './fare-extras.service';
import { QueryParamsDto } from '../common/dtos/query-params.dto';

@Controller('fare-extras')
export class FareExtrasController {
  constructor(private readonly fareExtrasService: FareExtrasService) {}

  @Get()
  findAll(@Query() filters: QueryParamsDto) {
    return this.fareExtrasService.findAll(filters);
  }
}
