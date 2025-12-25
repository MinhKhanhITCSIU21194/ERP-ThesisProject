import { Request, Response } from "express";
export declare class DepartmentController {
    getAllDepartments(req: Request, res: Response): Promise<void>;
    getDepartmentHierarchy(req: Request, res: Response): Promise<void>;
    getDepartmentById(req: Request, res: Response): Promise<void>;
    getDepartmentEmployees(req: Request, res: Response): Promise<void>;
    getDepartmentStats(req: Request, res: Response): Promise<void>;
    createDepartment(req: Request, res: Response): Promise<void>;
    updateDepartment(req: Request, res: Response): Promise<void>;
    deleteDepartment(req: Request, res: Response): Promise<void>;
    hardDeleteDepartment(req: Request, res: Response): Promise<void>;
    moveEmployees(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
declare const _default: DepartmentController;
export default _default;
//# sourceMappingURL=department.controller.d.ts.map