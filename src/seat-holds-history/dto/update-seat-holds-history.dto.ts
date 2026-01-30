import { PartialType } from '@nestjs/mapped-types';
import { CreateSeatHoldsHistoryDto } from './create-seat-holds-history.dto';

export class UpdateSeatHoldsHistoryDto extends PartialType(CreateSeatHoldsHistoryDto) {}
