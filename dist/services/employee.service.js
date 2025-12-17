"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeService = void 0;
const typeorm_1 = require("../config/typeorm");
const employee_1 = require("../models/entities/employee");
const typeorm_2 = require("typeorm");
class EmployeeService {
    constructor() {
        this.employeeRepository = typeorm_1.AppDataSource.getRepository(employee_1.Employee);
    }
    async getEmployees(pagination, filters) {
        const { pageIndex = 0, pageSize = 10, sortBy = "createdAt", sortOrder = "DESC", } = pagination;
        const where = {};
        if (filters) {
            if (filters.search) {
            }
            if (filters.employmentStatus) {
                if (Array.isArray(filters.employmentStatus)) {
                    where.employmentStatus = (0, typeorm_2.In)(filters.employmentStatus);
                }
                else {
                    where.employmentStatus = filters.employmentStatus;
                }
            }
            if (filters.department) {
                where.department = filters.department;
            }
            if (filters.position) {
                where.position = filters.position;
            }
            if (filters.reportingManagerId) {
                where.reportingManagerId = filters.reportingManagerId;
            }
        }
        const queryBuilder = this.employeeRepository
            .createQueryBuilder("employee")
            .leftJoinAndSelect("employee.user", "user")
            .leftJoinAndSelect("employee.positionEntity", "position")
            .leftJoinAndSelect("employee.departments", "employeeDepartments")
            .leftJoinAndSelect("employeeDepartments.department", "department")
            .leftJoinAndSelect("employee.contracts", "contracts")
            .addOrderBy("contracts.status", "DESC")
            .addOrderBy("contracts.startDate", "DESC");
        if (filters?.search) {
            queryBuilder.where("(employee.firstName ILIKE :search OR employee.lastName ILIKE :search OR employee.email ILIKE :search OR employee.employeeCode ILIKE :search)", { search: `%${filters.search}%` });
        }
        if (filters?.employmentStatus) {
            if (Array.isArray(filters.employmentStatus)) {
                queryBuilder.andWhere("employee.employmentStatus IN (:...statuses)", {
                    statuses: filters.employmentStatus,
                });
            }
            else {
                queryBuilder.andWhere("employee.employmentStatus = :status", {
                    status: filters.employmentStatus,
                });
            }
        }
        if (filters?.department) {
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filters.department);
            if (isUUID) {
                queryBuilder.andWhere("department.id = :departmentId", {
                    departmentId: filters.department,
                });
            }
            else {
                queryBuilder.andWhere("employee.department = :department", {
                    department: filters.department,
                });
            }
        }
        if (filters?.position) {
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filters.position);
            if (isUUID) {
                queryBuilder.andWhere("employee.positionId = :positionId", {
                    positionId: filters.position,
                });
            }
            else {
                queryBuilder.andWhere("employee.position = :position", {
                    position: filters.position,
                });
            }
        }
        if (filters?.reportingManagerId) {
            queryBuilder.andWhere("employee.reportingManagerId = :reportingManagerId", { reportingManagerId: filters.reportingManagerId });
        }
        if (filters?.hireDateFrom) {
            queryBuilder.andWhere("employee.hireDate >= :hireDateFrom", {
                hireDateFrom: filters.hireDateFrom,
            });
        }
        if (filters?.hireDateTo) {
            queryBuilder.andWhere("employee.hireDate <= :hireDateTo", {
                hireDateTo: filters.hireDateTo,
            });
        }
        const validSortFields = [
            "employeeCode",
            "firstName",
            "lastName",
            "email",
            "hireDate",
            "employmentStatus",
            "department",
            "position",
            "createdAt",
            "updatedAt",
        ];
        const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
        queryBuilder.orderBy(`employee.${sortField}`, sortOrder);
        const total = await queryBuilder.getCount();
        queryBuilder.skip(pageIndex * pageSize).take(pageSize);
        const data = await queryBuilder.getMany();
        const totalPages = Math.ceil(total / pageSize);
        return {
            data,
            total,
            pageIndex,
            pageSize,
            totalPages,
            hasNext: pageIndex < totalPages - 1,
            hasPrevious: pageIndex > 0,
        };
    }
    async getEmployeeById(employeeId) {
        const employee = await this.employeeRepository
            .createQueryBuilder("employee")
            .leftJoinAndSelect("employee.user", "user")
            .leftJoinAndSelect("employee.positionEntity", "positionEntity")
            .leftJoinAndSelect("employee.departments", "departments")
            .leftJoinAndSelect("departments.department", "department")
            .leftJoinAndSelect("employee.contracts", "contracts")
            .addOrderBy("contracts.status", "DESC")
            .addOrderBy("contracts.startDate", "DESC")
            .where("employee.employeeId = :employeeId", { employeeId })
            .getOne();
        return employee;
    }
    async getEmployeeByCode(employeeCode) {
        const employee = await this.employeeRepository
            .createQueryBuilder("employee")
            .leftJoinAndSelect("employee.user", "user")
            .leftJoinAndSelect("employee.positionEntity", "positionEntity")
            .leftJoinAndSelect("employee.departments", "departments")
            .leftJoinAndSelect("departments.department", "department")
            .leftJoinAndSelect("employee.contracts", "contracts")
            .addOrderBy("contracts.status", "DESC")
            .addOrderBy("contracts.startDate", "DESC")
            .where("employee.employeeCode = :employeeCode", { employeeCode })
            .getOne();
        return employee;
    }
    async getEmployeeByUserId(userId) {
        const employee = await this.employeeRepository
            .createQueryBuilder("employee")
            .leftJoinAndSelect("employee.user", "user")
            .leftJoinAndSelect("employee.positionEntity", "positionEntity")
            .leftJoinAndSelect("employee.departments", "departments")
            .leftJoinAndSelect("departments.department", "department")
            .leftJoinAndSelect("employee.contracts", "contracts")
            .addOrderBy("contracts.status", "DESC")
            .addOrderBy("contracts.startDate", "DESC")
            .where("employee.userId = :userId", { userId })
            .getOne();
        return employee;
    }
    async getEmployeeByEmail(email) {
        const employee = await this.employeeRepository
            .createQueryBuilder("employee")
            .leftJoinAndSelect("employee.user", "user")
            .leftJoinAndSelect("employee.positionEntity", "positionEntity")
            .leftJoinAndSelect("employee.departments", "departments")
            .leftJoinAndSelect("departments.department", "department")
            .leftJoinAndSelect("employee.contracts", "contracts")
            .addOrderBy("contracts.status", "DESC")
            .addOrderBy("contracts.startDate", "DESC")
            .where("employee.email = :email", { email })
            .getOne();
        return employee;
    }
    async createEmployee(data) {
        const existingCode = await this.getEmployeeByCode(data.employeeCode);
        if (existingCode) {
            throw new Error(`Employee with code ${data.employeeCode} already exists`);
        }
        const existingEmail = await this.getEmployeeByEmail(data.email);
        if (existingEmail) {
            throw new Error(`Employee with email ${data.email} already exists`);
        }
        const employee = this.employeeRepository.create(data);
        return await this.employeeRepository.save(employee);
    }
    async updateEmployee(employeeId, data) {
        const employee = await this.getEmployeeById(employeeId);
        if (!employee) {
            throw new Error(`Employee with ID ${employeeId} not found`);
        }
        if (data.employeeCode && data.employeeCode !== employee.employeeCode) {
            const existingCode = await this.getEmployeeByCode(data.employeeCode);
            if (existingCode) {
                throw new Error(`Employee with code ${data.employeeCode} already exists`);
            }
        }
        if (data.email && data.email !== employee.email) {
            const existingEmail = await this.getEmployeeByEmail(data.email);
            if (existingEmail) {
                throw new Error(`Employee with email ${data.email} already exists`);
            }
        }
        Object.assign(employee, data);
        return await this.employeeRepository.save(employee);
    }
    async deleteEmployee(employeeId) {
        const employee = await this.getEmployeeById(employeeId);
        if (!employee) {
            throw new Error(`Employee with ID ${employeeId} not found`);
        }
        await this.employeeRepository.softDelete(employeeId);
    }
    async restoreEmployee(employeeId) {
        await this.employeeRepository.restore(employeeId);
    }
    async permanentlyDeleteEmployee(employeeId) {
        await this.employeeRepository.delete(employeeId);
    }
    async getActiveEmployeesCount() {
        return await this.employeeRepository.count({
            where: { employmentStatus: employee_1.EmploymentStatus.ACTIVE },
        });
    }
    async getEmployeesWithExpiringContracts(daysThreshold = 30) {
        const today = new Date();
        const thresholdDate = new Date();
        thresholdDate.setDate(today.getDate() + daysThreshold);
        return await this.employeeRepository
            .createQueryBuilder("employee")
            .leftJoinAndSelect("employee.contracts", "contracts")
            .where("contracts.endDate IS NOT NULL")
            .andWhere("contracts.endDate <= :thresholdDate", {
            thresholdDate,
        })
            .andWhere("contracts.endDate > :today", { today })
            .andWhere("contracts.status = :contractStatus", {
            contractStatus: "ACTIVE",
        })
            .andWhere("employee.employmentStatus = :status", {
            status: employee_1.EmploymentStatus.ACTIVE,
        })
            .orderBy("contracts.endDate", "ASC")
            .getMany();
    }
    async getEmployeesByDepartment(department, pagination) {
        return await this.getEmployees(pagination || { pageIndex: 0, pageSize: 10 }, { department });
    }
    async getEmployeesByManager(managerId, pagination) {
        return await this.getEmployees(pagination || { pageIndex: 0, pageSize: 10 }, { reportingManagerId: managerId });
    }
    async getEmployeeStatistics() {
        const total = await this.employeeRepository.count();
        const active = await this.employeeRepository.count({
            where: { employmentStatus: employee_1.EmploymentStatus.ACTIVE },
        });
        const inactive = await this.employeeRepository.count({
            where: { employmentStatus: employee_1.EmploymentStatus.INACTIVE },
        });
        const onLeave = await this.employeeRepository.count({
            where: { employmentStatus: employee_1.EmploymentStatus.ON_LEAVE },
        });
        const byContractTypeRaw = await this.employeeRepository
            .createQueryBuilder("employee")
            .select("employee.contractType", "type")
            .addSelect("COUNT(*)", "count")
            .groupBy("employee.contractType")
            .getRawMany();
        const byContractType = {};
        byContractTypeRaw.forEach((item) => {
            byContractType[item.type] = parseInt(item.count);
        });
        const byDepartmentRaw = await this.employeeRepository
            .createQueryBuilder("employee")
            .select("employee.department", "department")
            .addSelect("COUNT(*)", "count")
            .where("employee.department IS NOT NULL")
            .groupBy("employee.department")
            .getRawMany();
        const byDepartment = {};
        byDepartmentRaw.forEach((item) => {
            byDepartment[item.department] = parseInt(item.count);
        });
        return {
            total,
            active,
            inactive,
            onLeave,
            byContractType,
            byDepartment,
        };
    }
}
exports.EmployeeService = EmployeeService;
//# sourceMappingURL=employee.service.js.map