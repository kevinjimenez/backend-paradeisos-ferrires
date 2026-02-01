import { Controller, Get, Query } from '@nestjs/common';
import { SchedulesFilterDto } from './dto/schedules-filter.dto';
import { SchedulesService } from './schedules.service';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { ScheduleResponse } from './interfaces/schedule-response.interface';

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
