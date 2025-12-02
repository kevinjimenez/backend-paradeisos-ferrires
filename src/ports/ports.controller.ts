import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreatePortDto } from './dto/create-port.dto';
import { UpdatePortDto } from './dto/update-port.dto';
import { PortsService } from './ports.service';

@Controller('ports')
export class PortsController {
  constructor(private readonly portsService: PortsService) {}

  @Post()
  create(@Body() createPortDto: CreatePortDto) {
    return this.portsService.create(createPortDto);
  }

  @Get()
  // @Header('Cache-Control', 'no-store')
  findAll() {
    return this.portsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.portsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePortDto: UpdatePortDto) {
    return this.portsService.update(+id, updatePortDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.portsService.remove(+id);
  }
}
