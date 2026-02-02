import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse } from './../common/interfaces/api-response.interface';
import { SchedulesFilterDto } from './dto/schedules-filter.dto';
import { ScheduleResponse } from './interfaces/schedule-response.interface';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  findAll(
    @Query() filters: SchedulesFilterDto,
  ): Promise<ApiResponse<ScheduleResponse[]>> {
    return this.schedulesService.findAll(filters);
  }
}
