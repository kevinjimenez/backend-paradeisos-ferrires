import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { CommonModule } from './common/common.module';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { DatabasesModule } from './databases/databases.module';
import { FerriesModule } from './ferries/ferries.module';
import { HealthModule } from './health/health.module';
import { IslandsModule } from './islands/islands.module';
import { PassengersModule } from './passengers/passengers.module';
import { PaymentsModule } from './payments/payments.module';
import { PortsModule } from './ports/ports.module';
import { RoutesModule } from './routes/routes.module';
import { SchedulesModule } from './schedules/schedules.module';
import { SeatHoldsModule } from './seat-holds/seat-holds.module';
import { TicketsModule } from './tickets/tickets.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CommonModule,
    HealthModule,
    DatabasesModule,
    UsersModule,
    FerriesModule,
    PortsModule,
    RoutesModule,
    SchedulesModule,
    TicketsModule,
    IslandsModule,
    PassengersModule,
    PaymentsModule,
    SeatHoldsModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
