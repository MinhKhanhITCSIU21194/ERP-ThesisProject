import { AppDataSource } from "../config/typeorm";
import {
  Employee,
  EmploymentStatus,
  MaritalStatus,
  Gender,
} from "../models/entities/employee";
import { ContractType } from "../models/entities/contract";
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
  weeklyWorkHours?: number;
  salary?: number;
  salaryCurrency?: string;
  salaryFrequency?: string;

  // Note: Contract information moved to separate Contract entity
  // Use contract service to create/manage employee contracts

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
  // Note: contractType filter removed - use contract service endpoints to filter by contract type
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

      // Note: contractType filtering removed as contracts are now a separate entity
      // Use contract service endpoints to filter by contract type

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
      .leftJoinAndSelect("employeeDepartments.department", "department")
      .leftJoinAndSelect("employee.contracts", "contracts")
      .addOrderBy("contracts.status", "DESC") // Active contracts first (ACTIVE > INACTIVE/TERMINATED alphabetically)
      .addOrderBy("contracts.startDate", "DESC"); // Then by most recent start date

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

    // Note: contractType filtering removed as contracts are now a separate entity
    // Use contract service endpoints to filter by contract type

    if (filters?.department) {
      // Check if it's a UUID (department ID) or a string (legacy department name)
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          filters.department
        );

      if (isUUID) {
        // Filter by department ID through the employeeDepartments relationship
        queryBuilder.andWhere("department.id = :departmentId", {
          departmentId: filters.department,
        });
      } else {
        // Legacy: Filter by department string field
        queryBuilder.andWhere("employee.department = :department", {
          department: filters.department,
        });
      }
    }

    if (filters?.position) {
      // Check if it's a UUID (position ID) or a string (legacy position name)
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          filters.position
        );

      if (isUUID) {
        // Filter by position ID (positionEntity relationship)
        queryBuilder.andWhere("employee.positionId = :positionId", {
          positionId: filters.position,
        });
      } else {
        // Legacy: Filter by position string field
        queryBuilder.andWhere("employee.position = :position", {
          position: filters.position,
        });
      }
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
    const employee = await this.employeeRepository
      .createQueryBuilder("employee")
      .leftJoinAndSelect("employee.user", "user")
      .leftJoinAndSelect("employee.positionEntity", "positionEntity")
      .leftJoinAndSelect("employee.departments", "departments")
      .leftJoinAndSelect("departments.department", "department")
      .leftJoinAndSelect("employee.contracts", "contracts")
      .addOrderBy("contracts.status", "DESC") // Active contracts first
      .addOrderBy("contracts.startDate", "DESC")
      .where("employee.employeeId = :employeeId", { employeeId })
      .getOne();

    return employee;
  }

  /**
   * Get employee by employee code
   */
  async getEmployeeByCode(employeeCode: string): Promise<Employee | null> {
    const employee = await this.employeeRepository
      .createQueryBuilder("employee")
      .leftJoinAndSelect("employee.user", "user")
      .leftJoinAndSelect("employee.positionEntity", "positionEntity")
      .leftJoinAndSelect("employee.departments", "departments")
      .leftJoinAndSelect("departments.department", "department")
      .leftJoinAndSelect("employee.contracts", "contracts")
      .addOrderBy("contracts.status", "DESC") // Active contracts first
      .addOrderBy("contracts.startDate", "DESC")
      .where("employee.employeeCode = :employeeCode", { employeeCode })
      .getOne();

    return employee;
  }

  /**
   * Get employee by user ID
   */
  async getEmployeeByUserId(userId: string): Promise<Employee | null> {
    const employee = await this.employeeRepository
      .createQueryBuilder("employee")
      .leftJoinAndSelect("employee.user", "user")
      .leftJoinAndSelect("employee.positionEntity", "positionEntity")
      .leftJoinAndSelect("employee.departments", "departments")
      .leftJoinAndSelect("departments.department", "department")
      .leftJoinAndSelect("employee.contracts", "contracts")
      .addOrderBy("contracts.status", "DESC") // Active contracts first
      .addOrderBy("contracts.startDate", "DESC")
      .where("employee.userId = :userId", { userId })
      .getOne();

    return employee;
  }

  /**
   * Get employee by email
   */
  async getEmployeeByEmail(email: string): Promise<Employee | null> {
    const employee = await this.employeeRepository
      .createQueryBuilder("employee")
      .leftJoinAndSelect("employee.user", "user")
      .leftJoinAndSelect("employee.positionEntity", "positionEntity")
      .leftJoinAndSelect("employee.departments", "departments")
      .leftJoinAndSelect("departments.department", "department")
      .leftJoinAndSelect("employee.contracts", "contracts")
      .addOrderBy("contracts.status", "DESC") // Active contracts first
      .addOrderBy("contracts.startDate", "DESC")
      .where("employee.email = :email", { email })
      .getOne();

    return employee;
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
        status: EmploymentStatus.ACTIVE,
      })
      .orderBy("contracts.endDate", "ASC")
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
