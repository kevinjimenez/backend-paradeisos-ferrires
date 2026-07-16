import { DocumentType, ContactType } from './../../databases/generated/prisma/enums';
import {
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
}
