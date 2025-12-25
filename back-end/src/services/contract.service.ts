import { AppDataSource } from "../config/typeorm";
import { Contract, ContractStatus } from "../models/entities/contract";
import { Employee } from "../models/entities/employee";
import { Repository, LessThanOrEqual, MoreThan, Not } from "typeorm";

export class ContractService {
  private contractRepository: Repository<Contract>;
  private employeeRepository: Repository<Employee>;

  constructor() {
    this.contractRepository = AppDataSource.getRepository(Contract);
    this.employeeRepository = AppDataSource.getRepository(Employee);
  }

  /**
   * Get all contracts with pagination and filtering
   */
  async getContracts(
    pageIndex: number = 0,
    pageSize: number = 10,
    sortBy: string = "createdAt",
    sortOrder: "ASC" | "DESC" = "DESC",
    filters?: {
      contractType?: string;
      workingType?: string;
      status?: ContractStatus;
      employeeId?: string;
    }
  ) {
    const query = this.contractRepository
      .createQueryBuilder("contract")
      .leftJoinAndSelect("contract.employee", "employee")
      .leftJoinAndSelect("employee.positionEntity", "position")
      .leftJoinAndSelect("employee.departments", "departments")
      .leftJoinAndSelect("departments.department", "department")
      .where("contract.deletedAt IS NULL");

    // Apply filters
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

    // Sorting
    query.orderBy(`contract.${sortBy}`, sortOrder);

    // Pagination
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

  /**
   * Get contract by ID
   */
  async getContractById(contractId: string) {
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

  /**
   * Get contracts by employee ID
   */
  async getContractsByEmployeeId(employeeId: string) {
    const contracts = await this.contractRepository.find({
      where: { employeeId },
      relations: ["employee"],
      order: { startDate: "DESC" },
    });

    return contracts;
  }

  /**
   * Get contracts that are expiring soon
   */
  async getExpiringContracts(
    days: number = 30,
    filters?: {
      contractType?: string;
      workingType?: string;
    }
  ) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const query = this.contractRepository
      .createQueryBuilder("contract")
      .leftJoinAndSelect("contract.employee", "employee")
      .leftJoinAndSelect("employee.positionEntity", "position")
      .leftJoinAndSelect("employee.departments", "departments")
      .leftJoinAndSelect("departments.department", "department")
      .where("contract.status = :status", { status: ContractStatus.ACTIVE })
      .andWhere("contract.endDate IS NOT NULL")
      .andWhere("contract.endDate > :today", { today })
      .andWhere("contract.endDate <= :futureDate", { futureDate })
      .andWhere("contract.deletedAt IS NULL");

    // Apply filters
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

  /**
   * Create a new contract
   */
  async createContract(contractData: Partial<Contract>) {
    // Verify employee exists
    const employee = await this.employeeRepository.findOne({
      where: { employeeId: contractData.employeeId },
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    // Generate contract number if not provided
    if (!contractData.contractNumber) {
      const count = await this.contractRepository.count();
      contractData.contractNumber = `CNT-${String(count + 1).padStart(6, "0")}`;
    }

    // Check for overlapping active contracts
    if (contractData.employeeId) {
      const overlappingContracts = await this.contractRepository
        .createQueryBuilder("contract")
        .where("contract.employeeId = :employeeId", {
          employeeId: contractData.employeeId,
        })
        .andWhere("contract.status = :status", {
          status: ContractStatus.ACTIVE,
        })
        .andWhere("contract.deletedAt IS NULL")
        .andWhere(
          "(contract.endDate IS NULL OR contract.endDate > :startDate)",
          { startDate: contractData.startDate }
        )
        .getMany();

      // Terminate overlapping contracts
      if (overlappingContracts.length > 0) {
        for (const existingContract of overlappingContracts) {
          existingContract.status = ContractStatus.TERMINATED;
          existingContract.endDate = new Date(contractData.startDate as Date);
          // Set end date to one day before new contract starts
          existingContract.endDate.setDate(
            existingContract.endDate.getDate() - 1
          );
          await this.contractRepository.save(existingContract);
        }
      }
    }

    const contract = this.contractRepository.create(contractData);
    await this.contractRepository.save(contract);

    return contract;
  }

  /**
   * Update contract
   */
  async updateContract(contractId: string, contractData: Partial<Contract>) {
    const contract = await this.contractRepository.findOne({
      where: { id: contractId },
    });

    if (!contract) {
      throw new Error("Contract not found");
    }

    // Update fields
    Object.assign(contract, contractData);
    await this.contractRepository.save(contract);

    return contract;
  }

  /**
   * Delete contract (soft delete)
   */
  async deleteContract(contractId: string) {
    const contract = await this.contractRepository.findOne({
      where: { id: contractId },
    });

    if (!contract) {
      throw new Error("Contract not found");
    }

    await this.contractRepository.softDelete(contractId);

    return { message: "Contract deleted successfully" };
  }

  /**
   * Get contract statistics
   */
  async getContractStatistics() {
    const totalContracts = await this.contractRepository.count({
      where: { deletedAt: null as any },
    });

    const activeContracts = await this.contractRepository.count({
      where: { status: ContractStatus.ACTIVE, deletedAt: null as any },
    });

    const expiringContracts = await this.getExpiringContracts(30);

    const expiredContracts = await this.contractRepository.count({
      where: { status: ContractStatus.EXPIRED, deletedAt: null as any },
    });

    return {
      totalContracts,
      activeContracts,
      expiringCount: expiringContracts.length,
      expiredContracts,
    };
  }
}
