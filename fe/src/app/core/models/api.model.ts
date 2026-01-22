export interface ApiResponse<T> {
  code: number;
  message?: string;
  results: T;
}
