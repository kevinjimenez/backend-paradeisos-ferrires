import { PartialType } from '@nestjs/mapped-types';
import { CreateFerryDto } from './create-ferry.dto';

export class UpdateFerryDto extends PartialType(CreateFerryDto) {}
