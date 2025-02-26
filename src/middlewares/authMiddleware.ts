import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface RequestWithUser extends Request {
  user?: JwtPayload | string;
}

export const authMiddleware = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    res.status(401).json({ msg: 'Authorization header is missing' });
    return;
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '')
    : authHeader;

  if (!token) {
    res.status(401).json({ msg: 'No token provided, authorization denied' });
    return;
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET as string);
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid or has expired' });
    return;
  }
};
