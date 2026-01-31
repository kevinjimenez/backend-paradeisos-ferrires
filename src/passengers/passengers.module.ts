import { Module } from '@nestjs/common';
import { PassengersService } from './passengers.service';

@Module({
  providers: [PassengersService],
  exports: [PassengersService],
})
export class PassengersModule {}
