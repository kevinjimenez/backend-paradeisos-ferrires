import { Module } from '@nestjs/common';
import { PortsService } from './ports.service';
import { PortsController } from './ports.controller';
import { PortsRepository } from './ports.repository';

@Module({
  controllers: [PortsController],
  providers: [PortsService, PortsRepository],
})
export class PortsModule {}
