import { DocumentType } from './../../databases/generated/prisma/enums';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

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
  unitPrice: number; // Decimal @db.Decimal(10, 2)

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean; // Boolean @default(false)

  @IsOptional()
  @IsBoolean()
  checkedInOutbound?: boolean; // Boolean @default(false)

  @IsOptional()
  @IsBoolean()
  checkedInReturn?: boolean; // Boolean @default(false)

  @IsOptional()
  ticket?: string;
}
