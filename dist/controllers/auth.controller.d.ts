import { Request, Response } from "express";
export declare const checkEmailExist: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const signIn: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const emailVerification: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const verifyEmailCode: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const validateSession: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const setNewPassword: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.controller.d.ts.map