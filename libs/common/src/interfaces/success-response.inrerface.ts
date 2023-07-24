export interface SuccessResponse {
  readonly statusCode: number;

  readonly message: string;

  readonly count?: number;

  readonly data: any | any[];
}
