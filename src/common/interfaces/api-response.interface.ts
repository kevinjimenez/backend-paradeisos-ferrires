export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
