import { Injectable } from '@nestjs/common';
import { DatabasesService } from './../databases/databases.service';
import { CreatePassengerDto } from './dto/create-passenger.dto';
import { PassengerDtoMapper } from './mappers/passenger-dto.mapper';

@Injectable()
export class PassengersService {
  constructor(private databasesService: DatabasesService) {}

  async create(createPassengerDto: CreatePassengerDto) {
    const passengerToCreate =
      PassengerDtoMapper.toPrismaCreate(createPassengerDto);

    const newPassenger = await this.databasesService.passengers.upsert({
      where: {
        document_number: passengerToCreate.document_number,
        email: passengerToCreate.email,
      },
      create: passengerToCreate,
      update: passengerToCreate,
    });
    return newPassenger;
  }
}
