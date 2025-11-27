import { Global, Module } from '@nestjs/common';
import { DatabasesService } from './databases.service';

@Global()
@Module({
  providers: [DatabasesService],
  exports: [DatabasesService],
})
export class DatabasesModule {}
