import { Position, PositionLevel } from "../models/entities/position";
import { Employee } from "../models/entities/employee";
export declare class PositionService {
    private positionRepository;
    private employeeRepository;
    getAllPositions(filters?: {
        isActive?: boolean;
        level?: PositionLevel;
        search?: string;
        parentId?: string | null;
        minSalary?: number;
        maxSalary?: number;
    }): Promise<Position[]>;
    getPositionById(id: string): Promise<Position>;
    getPositionHierarchy(): Promise<Position[]>;
    createPosition(data: {
        name: string;
        description?: string;
        level?: PositionLevel;
        parentId?: string;
        minSalary?: number;
        maxSalary?: number;
        salaryCurrency?: string;
        code?: string;
        requirements?: string;
        responsibilities?: string;
        createdBy?: string;
    }): Promise<Position>;
    updatePosition(id: string, data: {
        name?: string;
        description?: string;
        level?: PositionLevel;
        parentId?: string;
        minSalary?: number;
        maxSalary?: number;
        salaryCurrency?: string;
        code?: string;
        requirements?: string;
        responsibilities?: string;
        isActive?: boolean;
        updatedBy?: string;
    }): Promise<Position>;
    deletePosition(id: string, deletedBy?: string): Promise<Position>;
    hardDeletePosition(id: string): Promise<{
        message: string;
    }>;
    getPositionEmployees(positionId: string, activeOnly?: boolean): Promise<Employee[]>;
    getPositionStats(positionId: string): Promise<{
        position: Position;
        totalEmployees: number;
        activeEmployees: number;
        subPositionsCount: number;
    }>;
    private isDescendant;
    getPositionsByLevel(level: PositionLevel): Promise<Position[]>;
    getPositionsBySalaryRange(minSalary: number, maxSalary: number): Promise<Position[]>;
    updateAllHeadcounts(): Promise<{
        message: string;
        updatedCount: number;
    }>;
}
//# sourceMappingURL=position.service.d.ts.map