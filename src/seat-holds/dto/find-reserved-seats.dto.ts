import { IsString, IsOptional, IsUUID } from 'class-validator';

export class FindReservedSeatsDto {
  @IsUUID()
  outbound: string;

  @IsString()
  @IsOptional()
  return?: string;
}
