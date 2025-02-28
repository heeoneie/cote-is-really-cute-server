import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const authMiddleware = (
  req: Request,
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
  if (!process.env.JWT_SECRET)
    throw new Error('JWT_SECRET 환경 변수가 설정되지 않았습니다.');

  try {
    req.user = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid or has expired' });
    return;
  }
};
