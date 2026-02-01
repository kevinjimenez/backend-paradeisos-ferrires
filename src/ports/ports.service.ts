import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { DatabasesService } from './../databases/databases.service';
import { PortResponse } from './interfaces/port-response.interface';

@Injectable()
export class PortsService {
  private readonly logger = new Logger(PortsService.name);

  constructor(private databasesService: DatabasesService) {}

  async findAll(): Promise<ApiResponse<PortResponse[]>> {
    try {
      const portsWithRelation = {
        id: true,
        name: true,
        islands: {
          select: {
            id: true,
            name: true,
          },
        },
      };

      const data = await this.databasesService.ports.findMany({
        select: portsWithRelation,
      });

      return {
        data,
      };
    } catch (error) {
      this.logger.error('Error fetching ports', error);
      throw new InternalServerErrorException('Failed to fetch ports');
    }
  }
}
