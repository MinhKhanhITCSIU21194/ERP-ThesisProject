import { Request, Response } from "express";
export declare class UserController {
    getAllUsers(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getUserById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getUsersByRole(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateUserStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateUserRole(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getUserStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare const userController: UserController;
//# sourceMappingURL=user.controller.d.ts.map