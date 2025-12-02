import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateFerryDto } from './dto/create-ferry.dto';
import { UpdateFerryDto } from './dto/update-ferry.dto';
import { FerriesService } from './ferries.service';

@Controller('ferries')
export class FerriesController {
  constructor(private readonly ferriesService: FerriesService) {}

  @Post()
  create(@Body() createFerryDto: CreateFerryDto) {
    return this.ferriesService.create(createFerryDto);
  }

  @Get()
  findAll() {
    return this.ferriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ferriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFerryDto: UpdateFerryDto) {
    return this.ferriesService.update(+id, updateFerryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ferriesService.remove(+id);
  }
}
