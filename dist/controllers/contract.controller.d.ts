import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
export declare class ContractController {
    private contractService;
    constructor();
    getContracts: (req: AuthRequest, res: Response) => Promise<void>;
    getContractById: (req: AuthRequest, res: Response) => Promise<void>;
    getContractsByEmployeeId: (req: AuthRequest, res: Response) => Promise<void>;
    getExpiringContracts: (req: AuthRequest, res: Response) => Promise<void>;
    createContract: (req: AuthRequest, res: Response) => Promise<void>;
    updateContract: (req: AuthRequest, res: Response) => Promise<void>;
    deleteContract: (req: AuthRequest, res: Response) => Promise<void>;
    getStatistics: (req: AuthRequest, res: Response) => Promise<void>;
}
//# sourceMappingURL=contract.controller.d.ts.map