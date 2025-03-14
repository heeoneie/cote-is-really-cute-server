import { JwtPayload } from 'jsonwebtoken';

export interface SearchUserQuery {
  type: 'nickName' | 'email';
  value: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      query: SearchUserQuery;
    }
  }
}
