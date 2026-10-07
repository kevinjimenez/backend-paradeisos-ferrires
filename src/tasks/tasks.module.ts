import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { SeatHoldsModule } from './../seat-holds/seat-holds.module';
import { SchedulesModule } from './../schedules/schedules.module';
import { TicketsModule } from './../tickets/tickets.module';
import { ScheduleTemplatesModule } from './../schedule-templates/schedule-templates.module';
import { ReleaseExpiredHoldsCommand } from './commands/release-expired-holds.command';
import { ScheduleGeneratorService } from './schedule-generator.service';

@Module({
  imports: [
    SeatHoldsModule,
    SchedulesModule,
    TicketsModule,
    ScheduleTemplatesModule,
  ],
  providers: [
    TasksService,
    ReleaseExpiredHoldsCommand,
    ScheduleGeneratorService,
  ],
  exports: [TasksService],
})
export class TasksModule {}
