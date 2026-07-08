import { Module } from '@nestjs/common';
import { IslandsService } from './islands.service';
import { IslandsController } from './islands.controller';
import { IslandsRepository } from './islands.repository';

@Module({
  controllers: [IslandsController],
  providers: [IslandsService, IslandsRepository],
})
export class IslandsModule {}
