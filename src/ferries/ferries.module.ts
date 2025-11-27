import { Module } from '@nestjs/common';
import { FerriesService } from './ferries.service';
import { FerriesController } from './ferries.controller';

@Module({
  controllers: [FerriesController],
  providers: [FerriesService],
})
export class FerriesModule {}
