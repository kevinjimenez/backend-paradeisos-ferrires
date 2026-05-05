import { DocumentType } from './../../databases/generated/prisma/enums';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { PassengerExtraDto } from './passenger-extra.dto';

export class CreatePassengerDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  documentNumber: string;

  @IsNotEmpty()
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @IsNotEmpty()
  @IsNumber()
  basePrice: number;

  @IsNotEmpty()
  @IsUUID()
  fareId: string;

  unitPrice?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerExtraDto)
  extras?: PassengerExtraDto[];

  resolvedExtras?: Array<{ extraId: string; quantity: number; unitPrice: number }>;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsBoolean()
  checkedInOutbound?: boolean;

  @IsOptional()
  @IsBoolean()
  checkedInReturn?: boolean;

  @IsOptional()
  ticket?: string;
}
