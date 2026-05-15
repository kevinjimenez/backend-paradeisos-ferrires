import { Module } from '@nestjs/common';
import { DatabasesModule } from 'src/databases/databases.module';
import { FaresController } from './fares.controller';
import { FaresRepository } from './fares.repository';
import { FaresService } from './fares.service';

@Module({
  imports: [DatabasesModule],
  controllers: [FaresController],
  providers: [FaresService, FaresRepository],
  exports: [FaresService],
})
export class FaresModule {}
