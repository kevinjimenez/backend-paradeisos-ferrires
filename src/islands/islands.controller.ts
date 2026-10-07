import { Controller, Get } from '@nestjs/common';
import { IslandsService } from './islands.service';

@Controller('islands')
export class IslandsController {
  constructor(private readonly islandsService: IslandsService) {}

  @Get()
  findAll() {
    return this.islandsService.findAll();
  }
}
