import { JwtDecodeResponse } from './jwt-decode-response.interface';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user?: JwtDecodeResponse;
}

export default RequestWithUser;
