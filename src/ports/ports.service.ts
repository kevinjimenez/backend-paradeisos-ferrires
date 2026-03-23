import { Injectable, Logger } from '@nestjs/common';
import { handleServiceError } from 'src/common/utils/service-error.handler';
import { PortResponse } from './interfaces/port-response.interface';
import { PortsRepository } from './ports.repository';

@Injectable()
export class PortsService {
  private readonly logger = new Logger(PortsService.name);

  constructor(private readonly portsRepository: PortsRepository) {}

  async findAllWithIslands(): Promise<PortResponse[]> {
    try {
      const data = await this.portsRepository.findAllWithIslands();

      return data;
    } catch (error) {
      return handleServiceError(error, this.logger, 'Failed to fetch ports');
    }
  }
}
