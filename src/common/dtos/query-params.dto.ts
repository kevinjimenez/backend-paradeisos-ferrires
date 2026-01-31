import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export class QueryParamsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  email?: string;
}
