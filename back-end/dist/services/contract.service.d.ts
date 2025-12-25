import { Contract, ContractStatus } from "../models/entities/contract";
export declare class ContractService {
    private contractRepository;
    private employeeRepository;
    constructor();
    getContracts(pageIndex?: number, pageSize?: number, sortBy?: string, sortOrder?: "ASC" | "DESC", filters?: {
        contractType?: string;
        workingType?: string;
        status?: ContractStatus;
        employeeId?: string;
    }): Promise<{
        contracts: Contract[];
        totalCount: number;
        pageIndex: number;
        pageSize: number;
    }>;
    getContractById(contractId: string): Promise<Contract>;
    getContractsByEmployeeId(employeeId: string): Promise<Contract[]>;
    getExpiringContracts(days?: number, filters?: {
        contractType?: string;
        workingType?: string;
    }): Promise<Contract[]>;
    createContract(contractData: Partial<Contract>): Promise<Contract>;
    updateContract(contractId: string, contractData: Partial<Contract>): Promise<Contract>;
    deleteContract(contractId: string): Promise<{
        message: string;
    }>;
    getContractStatistics(): Promise<{
        totalContracts: number;
        activeContracts: number;
        expiringCount: number;
        expiredContracts: number;
    }>;
}
//# sourceMappingURL=contract.service.d.ts.map