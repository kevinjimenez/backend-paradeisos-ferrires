import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaTransaction } from './../common/types/prisma-transaction.type';
import { Prisma } from './../databases/generated/prisma/client';
import { CreatePassengerDto } from './dto/create-passenger.dto';
import { PassengerMapper } from './mappers/passenger.mapper';
import { PassengersRepository } from './passengers.repository';

@Injectable()
export class PassengersService {
  private readonly logger = new Logger(PassengersService.name);

  constructor(private passengersRepository: PassengersRepository) {}

  async create(
    createPassengerDto: CreatePassengerDto,
    tx?: PrismaTransaction,
  ): Promise<Prisma.passengersModel> {
    try {
      const passengerToCreate =
        PassengerMapper.toPrismaCreate(createPassengerDto);

      const newPassenger = await this.passengersRepository.upsertByDocument(
        passengerToCreate,
        tx,
      );

      return newPassenger;
    } catch (error) {
      this.logger.error('Error creating passenger', error);
      throw new InternalServerErrorException('Failed to create passenger');
    }
  }
}
