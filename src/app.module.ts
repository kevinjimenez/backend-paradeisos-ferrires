import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { BookingModule } from './booking/booking.module';
import { CommonModule } from './common/common.module';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { ContactsModule } from './contacts/contacts.module';
import { DatabasesModule } from './databases/databases.module';
import { HealthModule } from './health/health.module';
import { PassengersModule } from './passengers/passengers.module';
import { PaymentsModule } from './payments/payments.module';
import { PortsModule } from './ports/ports.module';
import { SchedulesModule } from './schedules/schedules.module';
import { SeatHoldsHistoryModule } from './seat-holds-history/seat-holds-history.module';
import { TasksModule } from './tasks/tasks.module';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    CommonModule,
    HealthModule,
    DatabasesModule,
    PortsModule,
    SchedulesModule,
    TicketsModule,
    PassengersModule,
    PaymentsModule,
    BookingModule,
    TasksModule,
    SeatHoldsHistoryModule,
    ContactsModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
