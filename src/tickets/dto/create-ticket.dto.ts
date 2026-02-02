import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateContactDto } from './../../contacts/dto/create-contact.dto';
import { CreatePassengerDto } from './../../passengers/dto/create-passenger.dto';

export class CreateTicketDto {
  @IsNotEmpty()
  @IsEnum(['round_trip', 'one_way'])
  tripType: 'round_trip' | 'one_way';

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateContactDto)
  contact: CreateContactDto;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePassengerDto)
  passenger: CreatePassengerDto[];

  @IsNotEmpty()
  @IsUUID()
  outboundSchedule: string;

  @IsOptional()
  @IsUUID()
  returnSchedule: string;

  @IsNotEmpty()
  @IsUUID()
  outboundHold: string;

  @IsOptional()
  @IsUUID()
  returnHold: string;
}
