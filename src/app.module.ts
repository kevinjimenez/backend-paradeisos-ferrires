import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { BookingsModule } from './bookings/bookings.module';
import { CommonModule } from './common/common.module';
import { DatabasesModule } from './databases/databases.module';
import { FerriesModule } from './ferries/ferries.module';
import { HealthModule } from './health/health.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PortsModule } from './ports/ports.module';
import { RoutesModule } from './routes/routes.module';
import { SchedulesModule } from './schedules/schedules.module';
import { SeatsModule } from './seats/seats.module';
import { TicketsModule } from './tickets/tickets.module';
import { TripsModule } from './trips/trips.module';
import { UsersModule } from './users/users.module';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CommonModule,
    HealthModule,
    DatabasesModule,
    UsersModule,
    TripsModule,
    FerriesModule,
    PortsModule,
    RoutesModule,
    SchedulesModule,
    SeatsModule,
    BookingsModule,
    TicketsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
