import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ApiResponse } from './../common/interfaces/api-response.interface';
import { DatabasesService } from './../databases/databases.service';
import { Prisma } from './../databases/generated/prisma/client';
import { CreatePassengerDto } from './dto/create-passenger.dto';
import { PassengerDtoMapper } from './mappers/passenger-dto.mapper';

@Injectable()
export class PassengersService {
  private readonly logger = new Logger(PassengersService.name);

  constructor(private databasesService: DatabasesService) {}

  async create(
    createPassengerDto: CreatePassengerDto,
  ): Promise<ApiResponse<Prisma.passengersCreateInput>> {
    try {
      const passengerToCreate =
        PassengerDtoMapper.toPrismaCreate(createPassengerDto);

      const query: Prisma.passengersWhereUniqueInput = {
        document_number: passengerToCreate.document_number,
        email: passengerToCreate.email,
      };

      const newPassenger = await this.databasesService.passengers.upsert({
        where: query,
        create: passengerToCreate,
        update: passengerToCreate,
      });
      return {
        data: newPassenger,
      };
    } catch (error) {
      this.logger.error('Error creating passenger', error);
      throw new InternalServerErrorException('Failed to create passenger');
    }
  }
}
