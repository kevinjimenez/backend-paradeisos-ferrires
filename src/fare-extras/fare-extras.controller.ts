import { Controller, Get } from '@nestjs/common';
import { FareExtrasService } from './fare-extras.service';

@Controller('fare-extras')
export class FareExtrasController {
  constructor(private readonly fareExtrasService: FareExtrasService) {}

  @Get()
  findAll() {
    return this.fareExtrasService.findAll();
  }
}
