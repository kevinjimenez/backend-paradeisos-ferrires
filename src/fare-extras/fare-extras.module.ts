import { Module } from '@nestjs/common';
import { DatabasesModule } from 'src/databases/databases.module';
import { FareExtrasController } from './fare-extras.controller';
import { FareExtrasRepository } from './fare-extras.repository';
import { FareExtrasService } from './fare-extras.service';

@Module({
  imports: [DatabasesModule],
  controllers: [FareExtrasController],
  providers: [FareExtrasService, FareExtrasRepository],
  exports: [FareExtrasService],
})
export class FareExtrasModule {}