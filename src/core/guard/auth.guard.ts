import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

interface RequestWithUser extends Request {
    user?: {
      userId: number;
      email: string;
    };
  }
@Injectable()
export class AuthGuard implements NestMiddleware {
  use(req: RequestWithUser, res: Response, next: NextFunction) {
    try {

      // Decode and verify the token
      const decoded = verify(req.headers['authorization'], process.env.JWT_SECRET) as { userId: number; email: string };
      
      // Attach decoded user data to the request object
      req.user = decoded;

      // Proceed to the next middleware or resolver
      next();
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
