import { Controller, Get } from '@nestjs/common';
import { PortsService } from './ports.service';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { PortResponse } from './interfaces/port-response.interface';

@Controller('ports')
export class PortsController {
  constructor(private readonly portsService: PortsService) {}

  @Get()
  findAll(): Promise<ApiResponse<PortResponse[]>> {
    return this.portsService.findAll();
  }
}
