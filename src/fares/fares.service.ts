import { Injectable, NotFoundException } from '@nestjs/common';
import { FaresRepository } from './fares.repository';

@Injectable()
export class FaresService {
  constructor(private readonly faresRepository: FaresRepository) {}

  findAll() {
    return this.faresRepository.findAll();
  }

  async findById(id: string) {
    const fare = await this.faresRepository.findById(id);
    if (!fare) throw new NotFoundException(`Fare ${id} not found`);
    return fare;
  }
}
