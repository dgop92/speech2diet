import { ErrorCode } from "@common/errors";

export class CommonErrorInfoResponse {
  /**
   * the error code for this api error
   * @example one-posible-error-code
   */
  code: ErrorCode;
  /**
   * the error level for this api error. it can be application, repository, presentation
   */
  level: string;
  /**
   * the error message for this api error
   */
  message: string;
  /**
   * if the error code is invalid-input, the invalid field name will appear inside an object
   */
  params: string;
}

export class CommonErrorResponse {
  /**
   * the http status code for this api error
   */
  statusCode: number;
  /**
   * the timestamp for this api error
   */
  timestamp: string;
  /**
   * the rest api path for this api error
   */
  path: string;
  errorInfo: CommonErrorInfoResponse;
}
