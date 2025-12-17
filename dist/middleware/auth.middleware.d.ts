import { Request, Response, NextFunction } from "express";
import { Role } from "../models";
interface AuthRequest extends Request {
    user?: {
        userId: string;
        username?: string;
        email: string;
        role: Role;
        sessionId?: string;
    };
}
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const optionalAuth: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export { AuthRequest };
//# sourceMappingURL=auth.middleware.d.ts.map