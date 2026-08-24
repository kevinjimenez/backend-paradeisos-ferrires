import { Controller, Get } from '@nestjs/common';
import { ScheduleTemplatesService } from './schedule-templates.service';

@Controller('schedule-templates')
export class ScheduleTemplatesController {
  constructor(
    private readonly scheduleTemplatesService: ScheduleTemplatesService,
  ) {}

  @Get()
  findAll() {
    return this.scheduleTemplatesService.findAll();
  }
}
