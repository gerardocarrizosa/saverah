export type ApiSuccess<T> = { data: T };

export type ApiSuccessList<T> = { data: T[]; meta?: { total: number } };

export type ApiError = { error: string | string[] };

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
