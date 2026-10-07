import { Module } from '@nestjs/common';
import { ScheduleTemplatesService } from './schedule-templates.service';
import { ScheduleTemplatesController } from './schedule-templates.controller';
import { ScheduleTemplatesRepository } from './schedule-templates.repository';

@Module({
  controllers: [ScheduleTemplatesController],
  providers: [ScheduleTemplatesService, ScheduleTemplatesRepository],
  exports: [ScheduleTemplatesService, ScheduleTemplatesRepository],
})
export class ScheduleTemplatesModule {}
