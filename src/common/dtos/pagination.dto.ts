import { Type } from 'class-transformer';
import { IsOptional, IsNumber, Min, Max, IsInt } from 'class-validator';
import { envs } from '../config/envs';

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @IsInt()
  @Min(envs.paginationLimit)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}
