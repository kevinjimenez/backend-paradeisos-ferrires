import { Module } from '@nestjs/common';
import { PassengersService } from './passengers.service';
import { PassengersRepository } from './passengers.repository';

@Module({
  providers: [PassengersService, PassengersRepository],
  exports: [PassengersService, PassengersRepository],
})
export class PassengersModule {}
