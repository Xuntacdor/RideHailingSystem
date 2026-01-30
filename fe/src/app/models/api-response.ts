// models/api-response.ts
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  results: T;
}
