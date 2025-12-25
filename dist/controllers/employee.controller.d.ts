import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
export declare class EmployeeController {
    private employeeService;
    constructor();
    getEmployees: (req: AuthRequest, res: Response) => Promise<void>;
    getEmployeeById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getEmployeeByCode: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createEmployee: (req: AuthRequest, res: Response) => Promise<void>;
    updateEmployee: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteEmployee: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getStatistics: (req: AuthRequest, res: Response) => Promise<void>;
    getExpiringContracts: (req: AuthRequest, res: Response) => Promise<void>;
    getEmployeesByDepartment: (req: AuthRequest, res: Response) => Promise<void>;
    getEmployeesByManager: (req: AuthRequest, res: Response) => Promise<void>;
}
//# sourceMappingURL=employee.controller.d.ts.map