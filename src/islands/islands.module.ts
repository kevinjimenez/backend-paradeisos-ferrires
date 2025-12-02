import { Module } from '@nestjs/common';
import { IslandsService } from './islands.service';
import { IslandsController } from './islands.controller';

@Module({
  controllers: [IslandsController],
  providers: [IslandsService],
})
export class IslandsModule {}
