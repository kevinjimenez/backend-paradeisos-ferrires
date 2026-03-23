import { Type } from 'class-transformer';
import { IsOptional, IsNumber, Min, Max, IsInt } from 'class-validator';
import { envs } from '../config/envs';

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @IsInt()
  @Min(envs.paginationPage)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @IsInt()
  @Min(envs.paginationLimit)
  @Max(envs.paginationMax)
  @Type(() => Number)
  limit?: number;
}
