import { AppDataSource } from "../config/typeorm";
import {
  Employee,
  EmploymentStatus,
  ContractType,
  MaritalStatus,
  Gender,
} from "../models/entities/employee";
import { Repository, FindOptionsWhere, ILike, In } from "typeorm";

export interface CreateEmployeeDTO {
  // Basic Information
  employeeCode: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: Date;
  gender: Gender;
  maritalStatus: MaritalStatus;
  nationality?: string;
  nationalId?: string;
  passportNumber?: string;

  // Contact Information
  email: string;
  phoneNumber?: string;
  emergencyContactNumber?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;

  // Address Information
  currentAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  permanentAddress?: string;

  // Employment Information
  hireDate: Date;
  confirmationDate?: Date;
  employmentStatus?: EmploymentStatus;
  department?: string; // Legacy field
  position?: string; // Legacy field
  positionId?: string; // New: Link to Position entity
  jobTitle?: string;
  workLocation?: string;
  reportingManagerId?: string;

  // Contract Information
  contractType: ContractType;
  contractStartDate?: Date;
  contractEndDate?: Date;
  contractDetails?: string;
  weeklyWorkHours?: number;
  salary?: number;
  salaryCurrency?: string;
  salaryFrequency?: string;

  // Bank Information
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolderName?: string;
  bankBranchCode?: string;

  // Additional Information
  bloodGroup?: string;
  medicalConditions?: string;
  allergies?: string;
  profilePicture?: string;
  skills?: string;
  qualifications?: string;
  notes?: string;

  // User link (optional)
  userId?: string;

  // Audit
  createdBy?: string;
}

export interface UpdateEmployeeDTO extends Partial<CreateEmployeeDTO> {
  updatedBy?: string;
}

export interface EmployeeFilterDTO {
  search?: string; // Search by name, email, or employee code
  employmentStatus?: EmploymentStatus | EmploymentStatus[];
  contractType?: ContractType | ContractType[];
  department?: string;
  position?: string;
  hireDateFrom?: Date;
  hireDateTo?: Date;
  reportingManagerId?: string;
}

export interface PaginationParams {
  pageIndex: number; // 0-based index
  pageSize: number; // Number of items per page
  sortBy?: string; // Field to sort by (e.g., 'firstName', 'hireDate')
  sortOrder?: "ASC" | "DESC"; // Sort order
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export class EmployeeService {
  private employeeRepository: Repository<Employee>;

  constructor() {
    this.employeeRepository = AppDataSource.getRepository(Employee);
  }

  /**
   * Get all employees with pagination and filtering
   */
  async getEmployees(
    pagination: PaginationParams,
    filters?: EmployeeFilterDTO
  ): Promise<PaginatedResponse<Employee>> {
    const {
      pageIndex = 0,
      pageSize = 10,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = pagination;

    // Build where conditions
    const where: FindOptionsWhere<Employee> = {};

    if (filters) {
      // Search by name, email, or employee code
      if (filters.search) {
        // Note: For complex OR searches, we'll use query builder below
      }

      if (filters.employmentStatus) {
        if (Array.isArray(filters.employmentStatus)) {
          where.employmentStatus = In(filters.employmentStatus);
        } else {
          where.employmentStatus = filters.employmentStatus;
        }
      }

      if (filters.contractType) {
        if (Array.isArray(filters.contractType)) {
          where.contractType = In(filters.contractType);
        } else {
          where.contractType = filters.contractType;
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

    // Use query builder for complex searches
    const queryBuilder = this.employeeRepository
      .createQueryBuilder("employee")
      .leftJoinAndSelect("employee.user", "user")
      .leftJoinAndSelect("employee.positionEntity", "position")
      .leftJoinAndSelect("employee.departments", "employeeDepartments")
      .leftJoinAndSelect("employeeDepartments.department", "department");

    // Apply search filter
    if (filters?.search) {
      queryBuilder.where(
        "(employee.firstName ILIKE :search OR employee.lastName ILIKE :search OR employee.email ILIKE :search OR employee.employeeCode ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    // Apply other filters
    if (filters?.employmentStatus) {
      if (Array.isArray(filters.employmentStatus)) {
        queryBuilder.andWhere("employee.employmentStatus IN (:...statuses)", {
          statuses: filters.employmentStatus,
        });
      } else {
        queryBuilder.andWhere("employee.employmentStatus = :status", {
          status: filters.employmentStatus,
        });
      }
    }

    if (filters?.contractType) {
      if (Array.isArray(filters.contractType)) {
        queryBuilder.andWhere("employee.contractType IN (:...types)", {
          types: filters.contractType,
        });
      } else {
        queryBuilder.andWhere("employee.contractType = :type", {
          type: filters.contractType,
        });
      }
    }

    if (filters?.department) {
      queryBuilder.andWhere("employee.department = :department", {
        department: filters.department,
      });
    }

    if (filters?.position) {
      queryBuilder.andWhere("employee.position = :position", {
        position: filters.position,
      });
    }

    if (filters?.reportingManagerId) {
      queryBuilder.andWhere(
        "employee.reportingManagerId = :reportingManagerId",
        { reportingManagerId: filters.reportingManagerId }
      );
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

    // Apply sorting
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

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder.skip(pageIndex * pageSize).take(pageSize);

    // Execute query
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

  /**
   * Get employee by ID
   */
  async getEmployeeById(employeeId: string): Promise<Employee | null> {
    return await this.employeeRepository.findOne({
      where: { employeeId },
      relations: [
        "user",
        "positionEntity",
        "departments",
        "departments.department",
      ],
    });
  }

  /**
   * Get employee by employee code
   */
  async getEmployeeByCode(employeeCode: string): Promise<Employee | null> {
    return await this.employeeRepository.findOne({
      where: { employeeCode },
      relations: [
        "user",
        "positionEntity",
        "departments",
        "departments.department",
      ],
    });
  }

  /**
   * Get employee by user ID
   */
  async getEmployeeByUserId(userId: string): Promise<Employee | null> {
    return await this.employeeRepository.findOne({
      where: { userId },
      relations: [
        "user",
        "positionEntity",
        "departments",
        "departments.department",
      ],
    });
  }

  /**
   * Get employee by email
   */
  async getEmployeeByEmail(email: string): Promise<Employee | null> {
    return await this.employeeRepository.findOne({
      where: { email },
      relations: [
        "user",
        "positionEntity",
        "departments",
        "departments.department",
      ],
    });
  }

  /**
   * Create a new employee
   */
  async createEmployee(data: CreateEmployeeDTO): Promise<Employee> {
    // Check if employee code already exists
    const existingCode = await this.getEmployeeByCode(data.employeeCode);
    if (existingCode) {
      throw new Error(`Employee with code ${data.employeeCode} already exists`);
    }

    // Check if email already exists
    const existingEmail = await this.getEmployeeByEmail(data.email);
    if (existingEmail) {
      throw new Error(`Employee with email ${data.email} already exists`);
    }

    const employee = this.employeeRepository.create(data);
    return await this.employeeRepository.save(employee);
  }

  /**
   * Update an employee
   */
  async updateEmployee(
    employeeId: string,
    data: UpdateEmployeeDTO
  ): Promise<Employee> {
    const employee = await this.getEmployeeById(employeeId);
    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    // Check if updating employee code and it already exists
    if (data.employeeCode && data.employeeCode !== employee.employeeCode) {
      const existingCode = await this.getEmployeeByCode(data.employeeCode);
      if (existingCode) {
        throw new Error(
          `Employee with code ${data.employeeCode} already exists`
        );
      }
    }

    // Check if updating email and it already exists
    if (data.email && data.email !== employee.email) {
      const existingEmail = await this.getEmployeeByEmail(data.email);
      if (existingEmail) {
        throw new Error(`Employee with email ${data.email} already exists`);
      }
    }

    Object.assign(employee, data);
    return await this.employeeRepository.save(employee);
  }

  /**
   * Soft delete an employee
   */
  async deleteEmployee(employeeId: string): Promise<void> {
    const employee = await this.getEmployeeById(employeeId);
    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    await this.employeeRepository.softDelete(employeeId);
  }

  /**
   * Restore a soft-deleted employee
   */
  async restoreEmployee(employeeId: string): Promise<void> {
    await this.employeeRepository.restore(employeeId);
  }

  /**
   * Permanently delete an employee
   */
  async permanentlyDeleteEmployee(employeeId: string): Promise<void> {
    await this.employeeRepository.delete(employeeId);
  }

  /**
   * Get active employees count
   */
  async getActiveEmployeesCount(): Promise<number> {
    return await this.employeeRepository.count({
      where: { employmentStatus: EmploymentStatus.ACTIVE },
    });
  }

  /**
   * Get employees with expiring contracts
   */
  async getEmployeesWithExpiringContracts(
    daysThreshold: number = 30
  ): Promise<Employee[]> {
    const today = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(today.getDate() + daysThreshold);

    return await this.employeeRepository
      .createQueryBuilder("employee")
      .where("employee.contractEndDate IS NOT NULL")
      .andWhere("employee.contractEndDate <= :thresholdDate", {
        thresholdDate,
      })
      .andWhere("employee.contractEndDate > :today", { today })
      .andWhere("employee.employmentStatus = :status", {
        status: EmploymentStatus.ACTIVE,
      })
      .orderBy("employee.contractEndDate", "ASC")
      .getMany();
  }

  /**
   * Get employees by department
   */
  async getEmployeesByDepartment(
    department: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Employee>> {
    return await this.getEmployees(
      pagination || { pageIndex: 0, pageSize: 10 },
      { department }
    );
  }

  /**
   * Get employees by reporting manager
   */
  async getEmployeesByManager(
    managerId: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Employee>> {
    return await this.getEmployees(
      pagination || { pageIndex: 0, pageSize: 10 },
      { reportingManagerId: managerId }
    );
  }

  /**
   * Get employee statistics
   */
  async getEmployeeStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    onLeave: number;
    byContractType: Record<ContractType, number>;
    byDepartment: Record<string, number>;
  }> {
    const total = await this.employeeRepository.count();
    const active = await this.employeeRepository.count({
      where: { employmentStatus: EmploymentStatus.ACTIVE },
    });
    const inactive = await this.employeeRepository.count({
      where: { employmentStatus: EmploymentStatus.INACTIVE },
    });
    const onLeave = await this.employeeRepository.count({
      where: { employmentStatus: EmploymentStatus.ON_LEAVE },
    });

    // Get by contract type
    const byContractTypeRaw = await this.employeeRepository
      .createQueryBuilder("employee")
      .select("employee.contractType", "type")
      .addSelect("COUNT(*)", "count")
      .groupBy("employee.contractType")
      .getRawMany();

    const byContractType: Record<ContractType, number> = {} as any;
    byContractTypeRaw.forEach((item: any) => {
      byContractType[item.type as ContractType] = parseInt(item.count);
    });

    // Get by department
    const byDepartmentRaw = await this.employeeRepository
      .createQueryBuilder("employee")
      .select("employee.department", "department")
      .addSelect("COUNT(*)", "count")
      .where("employee.department IS NOT NULL")
      .groupBy("employee.department")
      .getRawMany();

    const byDepartment: Record<string, number> = {};
    byDepartmentRaw.forEach((item: any) => {
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
