import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from './../common/interfaces/api-response.interface';
import { PortResponse } from './interfaces/port-response.interface';
import { PortsService } from './ports.service';

@Controller('ports')
export class PortsController {
  constructor(private readonly portsService: PortsService) {}

  @Get()
  findAll(): Promise<ApiResponse<PortResponse[]>> {
    return this.portsService.findAll();
  }
}
