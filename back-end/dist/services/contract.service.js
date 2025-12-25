"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractService = void 0;
const typeorm_1 = require("../config/typeorm");
const contract_1 = require("../models/entities/contract");
const employee_1 = require("../models/entities/employee");
class ContractService {
    constructor() {
        this.contractRepository = typeorm_1.AppDataSource.getRepository(contract_1.Contract);
        this.employeeRepository = typeorm_1.AppDataSource.getRepository(employee_1.Employee);
    }
    async getContracts(pageIndex = 0, pageSize = 10, sortBy = "createdAt", sortOrder = "DESC", filters) {
        const query = this.contractRepository
            .createQueryBuilder("contract")
            .leftJoinAndSelect("contract.employee", "employee")
            .leftJoinAndSelect("employee.positionEntity", "position")
            .leftJoinAndSelect("employee.departments", "departments")
            .leftJoinAndSelect("departments.department", "department")
            .where("contract.deletedAt IS NULL");
        if (filters?.contractType) {
            query.andWhere("contract.contractType = :contractType", {
                contractType: filters.contractType,
            });
        }
        if (filters?.workingType) {
            query.andWhere("contract.workingType = :workingType", {
                workingType: filters.workingType,
            });
        }
        if (filters?.status) {
            query.andWhere("contract.status = :status", { status: filters.status });
        }
        if (filters?.employeeId) {
            query.andWhere("contract.employeeId = :employeeId", {
                employeeId: filters.employeeId,
            });
        }
        query.orderBy(`contract.${sortBy}`, sortOrder);
        const [contracts, totalCount] = await query
            .skip(pageIndex * pageSize)
            .take(pageSize)
            .getManyAndCount();
        return {
            contracts,
            totalCount,
            pageIndex,
            pageSize,
        };
    }
    async getContractById(contractId) {
        const contract = await this.contractRepository.findOne({
            where: { id: contractId },
            relations: [
                "employee",
                "employee.positionEntity",
                "employee.departments",
            ],
        });
        if (!contract) {
            throw new Error("Contract not found");
        }
        return contract;
    }
    async getContractsByEmployeeId(employeeId) {
        const contracts = await this.contractRepository.find({
            where: { employeeId },
            relations: ["employee"],
            order: { startDate: "DESC" },
        });
        return contracts;
    }
    async getExpiringContracts(days = 30, filters) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);
        const query = this.contractRepository
            .createQueryBuilder("contract")
            .leftJoinAndSelect("contract.employee", "employee")
            .leftJoinAndSelect("employee.positionEntity", "position")
            .leftJoinAndSelect("employee.departments", "departments")
            .leftJoinAndSelect("departments.department", "department")
            .where("contract.status = :status", { status: contract_1.ContractStatus.ACTIVE })
            .andWhere("contract.endDate IS NOT NULL")
            .andWhere("contract.endDate > :today", { today })
            .andWhere("contract.endDate <= :futureDate", { futureDate })
            .andWhere("contract.deletedAt IS NULL");
        if (filters?.contractType) {
            query.andWhere("contract.contractType = :contractType", {
                contractType: filters.contractType,
            });
        }
        if (filters?.workingType) {
            query.andWhere("contract.workingType = :workingType", {
                workingType: filters.workingType,
            });
        }
        const contracts = await query.orderBy("contract.endDate", "ASC").getMany();
        return contracts;
    }
    async createContract(contractData) {
        const employee = await this.employeeRepository.findOne({
            where: { employeeId: contractData.employeeId },
        });
        if (!employee) {
            throw new Error("Employee not found");
        }
        if (!contractData.contractNumber) {
            const count = await this.contractRepository.count();
            contractData.contractNumber = `CNT-${String(count + 1).padStart(6, "0")}`;
        }
        const contract = this.contractRepository.create(contractData);
        await this.contractRepository.save(contract);
        return contract;
    }
    async updateContract(contractId, contractData) {
        const contract = await this.contractRepository.findOne({
            where: { id: contractId },
        });
        if (!contract) {
            throw new Error("Contract not found");
        }
        Object.assign(contract, contractData);
        await this.contractRepository.save(contract);
        return contract;
    }
    async deleteContract(contractId) {
        const contract = await this.contractRepository.findOne({
            where: { id: contractId },
        });
        if (!contract) {
            throw new Error("Contract not found");
        }
        await this.contractRepository.softDelete(contractId);
        return { message: "Contract deleted successfully" };
    }
    async getContractStatistics() {
        const totalContracts = await this.contractRepository.count({
            where: { deletedAt: null },
        });
        const activeContracts = await this.contractRepository.count({
            where: { status: contract_1.ContractStatus.ACTIVE, deletedAt: null },
        });
        const expiringContracts = await this.getExpiringContracts(30);
        const expiredContracts = await this.contractRepository.count({
            where: { status: contract_1.ContractStatus.EXPIRED, deletedAt: null },
        });
        return {
            totalContracts,
            activeContracts,
            expiringCount: expiringContracts.length,
            expiredContracts,
        };
    }
}
exports.ContractService = ContractService;
//# sourceMappingURL=contract.service.js.map