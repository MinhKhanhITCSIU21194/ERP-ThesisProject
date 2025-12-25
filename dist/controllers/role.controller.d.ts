import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
declare class RoleController {
    private roleService;
    constructor();
    getRoles(req: Request, res: Response): Promise<void>;
    getRoleById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createRole(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateRole(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteRole(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getPermissions(req: Request, res: Response): Promise<void>;
    getStats(req: Request, res: Response): Promise<void>;
}
declare const roleController: RoleController;
export default roleController;
//# sourceMappingURL=role.controller.d.ts.map