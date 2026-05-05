import { Controller, Get } from '@nestjs/common';
import { FaresService } from './fares.service';

@Controller('fares')
export class FaresController {
  constructor(private readonly faresService: FaresService) {}

  @Get()
  findAll() {
    return this.faresService.findAll();
  }
}
