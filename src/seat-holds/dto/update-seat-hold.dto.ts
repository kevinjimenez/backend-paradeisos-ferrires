import { PartialType } from '@nestjs/mapped-types';
import { CreateSeatHoldDto } from './create-seat-hold.dto';

export class UpdateSeatHoldDto extends PartialType(CreateSeatHoldDto) {}
