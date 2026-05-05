import { Injectable, NotFoundException } from '@nestjs/common';
import { FareExtrasRepository } from './fare-extras.repository';

@Injectable()
export class FareExtrasService {
  constructor(private readonly fareExtrasRepository: FareExtrasRepository) {}

  findAll() {
    return this.fareExtrasRepository.findAll();
  }

  async findById(id: string) {
    const extra = await this.fareExtrasRepository.findById(id);
    if (!extra) throw new NotFoundException(`FareExtra ${id} not found`);
    return extra;
  }
}