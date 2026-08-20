import { DocumentType, ContactType } from './../../databases/generated/prisma/enums';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty()
  @IsEnum(ContactType)
  contactType: ContactType;

  @ValidateIf(o => o.contactType !== ContactType.juridical_person)
  @IsNotEmpty()
  @IsString()
  firstName?: string;

  @ValidateIf(o => o.contactType !== ContactType.juridical_person)
  @IsNotEmpty()
  @IsString()
  lastName?: string;

  @ValidateIf(o => o.contactType === ContactType.juridical_person)
  @IsNotEmpty()
  @IsString()
  legalName?: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  city?: string;

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

  // El contacto no necesariamente viaja — no requerido, y no se persiste
  // (no existe columna date_of_birth en `contacts`). Se acepta solo porque
  // el front comparte el mismo tipo de datos entre contacto y pasajero.
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;
}
