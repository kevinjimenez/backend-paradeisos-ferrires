import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class SchedulesFilterDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value as string)
  departureDate?: string; // 2025-12-03T00:00:00.000Z

  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => value as string)
  from?: string; // origin_port_id

  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => value as string)
  to?: string; // destination_port_id
}
