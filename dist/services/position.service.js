"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionService = void 0;
const typeorm_1 = require("../config/typeorm");
const position_1 = require("../models/entities/position");
const employee_1 = require("../models/entities/employee");
const typeorm_2 = require("typeorm");
class PositionService {
    constructor() {
        this.positionRepository = typeorm_1.AppDataSource.getRepository(position_1.Position);
        this.employeeRepository = typeorm_1.AppDataSource.getRepository(employee_1.Employee);
    }
    async getAllPositions(filters) {
        const where = {};
        if (filters?.isActive !== undefined) {
            where.isActive = filters.isActive;
        }
        else {
            where.isActive = true;
        }
        if (filters?.level) {
            where.level = filters.level;
        }
        if (filters?.search) {
            return this.positionRepository.find({
                where: [
                    { ...where, name: (0, typeorm_2.ILike)(`%${filters.search}%`) },
                    { ...where, code: (0, typeorm_2.ILike)(`%${filters.search}%`) },
                    { ...where, description: (0, typeorm_2.ILike)(`%${filters.search}%`) },
                ],
                relations: ["parentPosition", "subPositions", "employees"],
                order: { name: "ASC" },
            });
        }
        if (filters?.parentId !== undefined) {
            where.parentId = filters.parentId === null ? (0, typeorm_2.IsNull)() : filters.parentId;
        }
        const positions = await this.positionRepository.find({
            where,
            relations: ["parentPosition", "subPositions", "employees"],
            order: { name: "ASC" },
        });
        if (filters?.minSalary !== undefined || filters?.maxSalary !== undefined) {
            return positions.filter((pos) => {
                if (filters.minSalary &&
                    pos.minSalary &&
                    pos.minSalary < filters.minSalary) {
                    return false;
                }
                if (filters.maxSalary &&
                    pos.maxSalary &&
                    pos.maxSalary > filters.maxSalary) {
                    return false;
                }
                return true;
            });
        }
        return positions;
    }
    async getPositionById(id) {
        const position = await this.positionRepository.findOne({
            where: { id },
            relations: [
                "parentPosition",
                "subPositions",
                "employees",
                "employees.user",
            ],
        });
        if (!position) {
            throw new Error("Position not found");
        }
        return position;
    }
    async getPositionHierarchy() {
        const topLevelPositions = await this.positionRepository.find({
            where: { parentId: (0, typeorm_2.IsNull)(), isActive: true },
            relations: ["subPositions"],
            order: { name: "ASC" },
        });
        const loadSubPositions = async (position) => {
            if (position.subPositions && position.subPositions.length > 0) {
                position.subPositions = await Promise.all(position.subPositions.map(async (subPos) => {
                    const fullSubPos = await this.positionRepository.findOne({
                        where: { id: subPos.id },
                        relations: ["subPositions"],
                    });
                    if (fullSubPos) {
                        return loadSubPositions(fullSubPos);
                    }
                    return subPos;
                }));
            }
            return position;
        };
        return Promise.all(topLevelPositions.map((pos) => loadSubPositions(pos)));
    }
    async createPosition(data) {
        if (data.parentId) {
            const parentPosition = await this.positionRepository.findOne({
                where: { id: data.parentId },
            });
            if (!parentPosition) {
                throw new Error("Parent position not found");
            }
        }
        if (data.minSalary && data.maxSalary && data.minSalary > data.maxSalary) {
            throw new Error("Minimum salary cannot be greater than maximum salary");
        }
        if (data.code) {
            const existingPos = await this.positionRepository.findOne({
                where: { code: data.code },
            });
            if (existingPos) {
                throw new Error("Position code already exists");
            }
        }
        const position = this.positionRepository.create({
            ...data,
            isActive: true,
            headcount: 0,
        });
        return this.positionRepository.save(position);
    }
    async updatePosition(id, data) {
        const position = await this.getPositionById(id);
        if (data.parentId && data.parentId === id) {
            throw new Error("Position cannot be its own parent");
        }
        if (data.parentId && data.parentId !== position.parentId) {
            const parentPosition = await this.positionRepository.findOne({
                where: { id: data.parentId },
            });
            if (!parentPosition) {
                throw new Error("Parent position not found");
            }
            const isDescendant = await this.isDescendant(data.parentId, position.id);
            if (isDescendant) {
                throw new Error("Cannot set a descendant position as parent");
            }
        }
        const newMinSalary = data.minSalary ?? position.minSalary;
        const newMaxSalary = data.maxSalary ?? position.maxSalary;
        if (newMinSalary && newMaxSalary && newMinSalary > newMaxSalary) {
            throw new Error("Minimum salary cannot be greater than maximum salary");
        }
        if (data.code && data.code !== position.code) {
            const existingPos = await this.positionRepository.findOne({
                where: { code: data.code },
            });
            if (existingPos) {
                throw new Error("Position code already exists");
            }
        }
        Object.assign(position, data);
        return this.positionRepository.save(position);
    }
    async deletePosition(id, deletedBy) {
        const position = await this.getPositionById(id);
        const activeSubPositions = await this.positionRepository.count({
            where: { parentId: id, isActive: true },
        });
        if (activeSubPositions > 0) {
            throw new Error("Cannot delete position with active sub-positions. Please delete or move sub-positions first.");
        }
        const activeEmployees = await this.employeeRepository.count({
            where: { positionId: id, employmentStatus: employee_1.EmploymentStatus.ACTIVE },
        });
        if (activeEmployees > 0) {
            throw new Error("Cannot delete position with active employees. Please reassign employees first.");
        }
        position.isActive = false;
        position.updatedBy = deletedBy;
        return this.positionRepository.save(position);
    }
    async hardDeletePosition(id) {
        const position = await this.getPositionById(id);
        const subPositions = await this.positionRepository.count({
            where: { parentId: id },
        });
        if (subPositions > 0) {
            throw new Error("Cannot permanently delete position with sub-positions");
        }
        const employees = await this.employeeRepository.count({
            where: { positionId: id },
        });
        if (employees > 0) {
            throw new Error("Cannot permanently delete position with employees");
        }
        await this.positionRepository.remove(position);
        return { message: "Position permanently deleted" };
    }
    async getPositionEmployees(positionId, activeOnly = true) {
        const where = {
            positionId,
        };
        if (activeOnly) {
            where.employmentStatus = employee_1.EmploymentStatus.ACTIVE;
        }
        return this.employeeRepository.find({
            where,
            relations: ["user", "departments", "positionEntity"],
            order: { hireDate: "DESC" },
        });
    }
    async getPositionStats(positionId) {
        const position = await this.getPositionById(positionId);
        const totalEmployees = await this.employeeRepository.count({
            where: { positionId },
        });
        const activeEmployees = await this.employeeRepository.count({
            where: { positionId, employmentStatus: employee_1.EmploymentStatus.ACTIVE },
        });
        const subPositionsCount = await this.positionRepository.count({
            where: { parentId: positionId, isActive: true },
        });
        position.headcount = activeEmployees;
        await this.positionRepository.save(position);
        return {
            position,
            totalEmployees,
            activeEmployees,
            subPositionsCount,
        };
    }
    async isDescendant(possibleDescendantId, ancestorId) {
        const possibleDescendant = await this.positionRepository.findOne({
            where: { id: possibleDescendantId },
            relations: ["parentPosition"],
        });
        if (!possibleDescendant) {
            return false;
        }
        if (!possibleDescendant.parentId) {
            return false;
        }
        if (possibleDescendant.parentId === ancestorId) {
            return true;
        }
        return this.isDescendant(possibleDescendant.parentId, ancestorId);
    }
    async getPositionsByLevel(level) {
        return this.positionRepository.find({
            where: { level, isActive: true },
            relations: ["employees"],
            order: { name: "ASC" },
        });
    }
    async getPositionsBySalaryRange(minSalary, maxSalary) {
        const allPositions = await this.positionRepository.find({
            where: { isActive: true },
            order: { minSalary: "ASC" },
        });
        return allPositions.filter((pos) => {
            if (!pos.minSalary || !pos.maxSalary) {
                return false;
            }
            return pos.maxSalary >= minSalary && pos.minSalary <= maxSalary;
        });
    }
    async updateAllHeadcounts() {
        const positions = await this.positionRepository.find({
            where: { isActive: true },
        });
        const updates = await Promise.all(positions.map(async (position) => {
            const activeEmployees = await this.employeeRepository.count({
                where: {
                    positionId: position.id,
                    employmentStatus: employee_1.EmploymentStatus.ACTIVE,
                },
            });
            position.headcount = activeEmployees;
            return this.positionRepository.save(position);
        }));
        return {
            message: "Updated headcount for all positions",
            updatedCount: updates.length,
        };
    }
}
exports.PositionService = PositionService;
//# sourceMappingURL=position.service.js.map