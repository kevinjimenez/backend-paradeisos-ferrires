import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { QueryParamsDto } from './../../common/dtos/query-params.dto';

export class SchedulesFilterDto extends QueryParamsDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value as string)
  date?: string; // 2025-12-03T00:00:00.000Z

  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => value as string)
  origin?: string; // origin_port_id

  @IsOptional()
  @IsUUID()
  @Transform(({ value }) => value as string)
  destination?: string; // destination_port_id
}
