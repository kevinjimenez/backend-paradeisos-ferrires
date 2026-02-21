import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ApiResponse } from './../common/interfaces/api-response.interface';
import { PortResponse } from './interfaces/port-response.interface';
import { PortsRepository } from './ports.repository';

@Injectable()
export class PortsService {
  private readonly logger = new Logger(PortsService.name);

  constructor(private readonly portsRepository: PortsRepository) {}

  async findAllWithIslands(): Promise<ApiResponse<PortResponse[]>> {
    try {
      const data = await this.portsRepository.findAllWithIslands();

      return {
        data,
      };
    } catch (error) {
      this.logger.error('Error fetching ports', error);
      throw new InternalServerErrorException('Failed to fetch ports');
    }
  }
}
