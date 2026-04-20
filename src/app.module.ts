import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { pinoConfig } from './common/config/pino.config';
import { throttlerConfig } from './common/config/throttler.config';
import { AppController } from './app.controller';
import { BookingsModule } from './bookings/bookings.module';
import { CommonModule } from './common/common.module';
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
import { CatalogsModule } from './catalogs/catalogs.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    LoggerModule.forRoot(pinoConfig),
    ThrottlerModule.forRoot(throttlerConfig),
    CommonModule,
    HealthModule,
    DatabasesModule,
    PortsModule,
    SchedulesModule,
    TicketsModule,
    PassengersModule,
    PaymentsModule,
    BookingsModule,
    TasksModule,
    SeatHoldsHistoryModule,
    ContactsModule,
    CatalogsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
