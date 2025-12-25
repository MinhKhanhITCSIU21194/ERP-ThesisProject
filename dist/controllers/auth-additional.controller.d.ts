import { Request, Response } from "express";
export declare const refreshToken: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const logout: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const logoutFromAllDevices: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getActiveSessions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=auth-additional.controller.d.ts.map