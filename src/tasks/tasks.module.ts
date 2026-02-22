import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { SeatHoldsModule } from './../seat-holds/seat-holds.module';
import { SchedulesModule } from './../schedules/schedules.module';
import { TicketsModule } from './../tickets/tickets.module';
import { ReleaseExpiredHoldsCommand } from './commands/release-expired-holds.command';

@Module({
  imports: [SeatHoldsModule, SchedulesModule, TicketsModule],
  providers: [TasksService, ReleaseExpiredHoldsCommand],
  exports: [TasksService],
})
export class TasksModule {}
