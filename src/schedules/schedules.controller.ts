import { Controller, Get, Query } from '@nestjs/common';
import { SchedulesFilterDto } from './dto/schedules-filter.dto';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  findAll(@Query() filters: SchedulesFilterDto) {
    return this.schedulesService.findAll(filters);
  }
}
