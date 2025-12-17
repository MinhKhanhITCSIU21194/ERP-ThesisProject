"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentService = void 0;
const typeorm_1 = require("../config/typeorm");
const department_1 = require("../models/entities/department");
const employee_department_1 = require("../models/entities/employee-department");
const typeorm_2 = require("typeorm");
class DepartmentService {
    constructor() {
        this.departmentRepository = typeorm_1.AppDataSource.getRepository(department_1.Department);
        this.employeeDepartmentRepository = typeorm_1.AppDataSource.getRepository(employee_department_1.EmployeeDepartment);
    }
    async getAllDepartments(filters) {
        const where = {};
        if (filters?.isActive !== undefined) {
            where.isActive = filters.isActive;
        }
        else {
            where.isActive = true;
        }
        if (filters?.search) {
            return this.departmentRepository.find({
                where: [
                    { ...where, name: (0, typeorm_2.ILike)(`%${filters.search}%`) },
                    { ...where, code: (0, typeorm_2.ILike)(`%${filters.search}%`) },
                    { ...where, description: (0, typeorm_2.ILike)(`%${filters.search}%`) },
                ],
                relations: ["parentDepartment", "subDepartments", "employees"],
                order: { name: "ASC" },
            });
        }
        if (filters?.parentId !== undefined) {
            where.parentId = filters.parentId === null ? (0, typeorm_2.IsNull)() : filters.parentId;
        }
        return this.departmentRepository.find({
            where,
            relations: ["parentDepartment", "subDepartments", "employees"],
            order: { name: "ASC" },
        });
    }
    async getDepartmentById(id) {
        const department = await this.departmentRepository.findOne({
            where: { id },
            relations: [
                "parentDepartment",
                "subDepartments",
                "employees",
                "employees.employee",
            ],
        });
        if (!department) {
            throw new Error("Department not found");
        }
        return department;
    }
    async getDepartmentHierarchy() {
        const topLevelDepartments = await this.departmentRepository.find({
            where: { parentId: (0, typeorm_2.IsNull)(), isActive: true },
            relations: ["subDepartments"],
            order: { name: "ASC" },
        });
        const loadSubDepartments = async (department) => {
            if (department.subDepartments && department.subDepartments.length > 0) {
                department.subDepartments = await Promise.all(department.subDepartments.map(async (subDept) => {
                    const fullSubDept = await this.departmentRepository.findOne({
                        where: { id: subDept.id },
                        relations: ["subDepartments"],
                    });
                    if (fullSubDept) {
                        return loadSubDepartments(fullSubDept);
                    }
                    return subDept;
                }));
            }
            return department;
        };
        return Promise.all(topLevelDepartments.map((dept) => loadSubDepartments(dept)));
    }
    async createDepartment(data) {
        if (data.parentId) {
            const parentDepartment = await this.departmentRepository.findOne({
                where: { id: data.parentId },
            });
            if (!parentDepartment) {
                throw new Error("Parent department not found");
            }
        }
        if (data.code) {
            const existingDept = await this.departmentRepository.findOne({
                where: { code: data.code },
            });
            if (existingDept) {
                throw new Error("Department code already exists");
            }
        }
        const department = this.departmentRepository.create({
            ...data,
            isActive: true,
        });
        return this.departmentRepository.save(department);
    }
    async updateDepartment(id, data) {
        const department = await this.getDepartmentById(id);
        if (data.parentId && data.parentId === id) {
            throw new Error("Department cannot be its own parent");
        }
        if (data.parentId && data.parentId !== department.parentId) {
            const parentDepartment = await this.departmentRepository.findOne({
                where: { id: data.parentId },
            });
            if (!parentDepartment) {
                throw new Error("Parent department not found");
            }
            const isDescendant = await this.isDescendant(data.parentId, department.id);
            if (isDescendant) {
                throw new Error("Cannot set a descendant department as parent");
            }
        }
        if (data.code && data.code !== department.code) {
            const existingDept = await this.departmentRepository.findOne({
                where: { code: data.code },
            });
            if (existingDept) {
                throw new Error("Department code already exists");
            }
        }
        Object.assign(department, data);
        return this.departmentRepository.save(department);
    }
    async deleteDepartment(id, deletedBy) {
        const department = await this.getDepartmentById(id);
        const activeSubDepartments = await this.departmentRepository.count({
            where: { parentId: id, isActive: true },
        });
        if (activeSubDepartments > 0) {
            throw new Error("Cannot delete department with active sub-departments. Please delete or move sub-departments first.");
        }
        const activeEmployees = await this.employeeDepartmentRepository.count({
            where: { departmentId: id, isActive: true },
        });
        if (activeEmployees > 0) {
            throw new Error("Cannot delete department with active employees. Please move employees first.");
        }
        department.isActive = false;
        department.updatedBy = deletedBy;
        return this.departmentRepository.save(department);
    }
    async hardDeleteDepartment(id) {
        const department = await this.getDepartmentById(id);
        const subDepartments = await this.departmentRepository.count({
            where: { parentId: id },
        });
        if (subDepartments > 0) {
            throw new Error("Cannot permanently delete department with sub-departments");
        }
        const employeeAssociations = await this.employeeDepartmentRepository.count({
            where: { departmentId: id },
        });
        if (employeeAssociations > 0) {
            throw new Error("Cannot permanently delete department with employee associations");
        }
        await this.departmentRepository.remove(department);
        return { message: "Department permanently deleted" };
    }
    async getDepartmentEmployees(departmentId, includeInactive = false) {
        const where = {
            departmentId,
        };
        if (!includeInactive) {
            where.isActive = true;
        }
        return this.employeeDepartmentRepository.find({
            where,
            relations: ["employee", "employee.user"],
            order: { startDate: "DESC" },
        });
    }
    async getDepartmentStats(departmentId) {
        const department = await this.getDepartmentById(departmentId);
        const totalEmployees = await this.employeeDepartmentRepository.count({
            where: { departmentId, isActive: true },
        });
        const managers = await this.employeeDepartmentRepository.count({
            where: { departmentId, isActive: true, isManager: true },
        });
        const subDepartmentsCount = await this.departmentRepository.count({
            where: { parentId: departmentId, isActive: true },
        });
        return {
            department,
            totalEmployees,
            managers,
            subDepartmentsCount,
        };
    }
    async isDescendant(possibleDescendantId, ancestorId) {
        const possibleDescendant = await this.departmentRepository.findOne({
            where: { id: possibleDescendantId },
            relations: ["parentDepartment"],
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
    async moveEmployees(fromDepartmentId, toDepartmentId, employeeIds) {
        await this.getDepartmentById(fromDepartmentId);
        await this.getDepartmentById(toDepartmentId);
        const where = {
            departmentId: fromDepartmentId,
            isActive: true,
        };
        const employeeDepartments = employeeIds
            ? await this.employeeDepartmentRepository.find({
                where: employeeIds.map((empId) => ({
                    ...where,
                    employeeId: empId,
                })),
            })
            : await this.employeeDepartmentRepository.find({ where });
        const movedEmployees = await Promise.all(employeeDepartments.map(async (empDept) => {
            empDept.departmentId = toDepartmentId;
            empDept.isPrimary = false;
            return this.employeeDepartmentRepository.save(empDept);
        }));
        return {
            message: `Moved ${movedEmployees.length} employees`,
            movedCount: movedEmployees.length,
        };
    }
}
exports.DepartmentService = DepartmentService;
//# sourceMappingURL=department.service.js.map