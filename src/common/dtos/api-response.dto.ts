export class ApiResponseDto<T> {
  data: T;
  meta?: MetaDto;
}

export class MetaDto {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  extra?: Record<string, string>;
}
