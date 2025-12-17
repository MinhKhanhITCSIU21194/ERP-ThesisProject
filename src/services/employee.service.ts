import { AppDataSource } from "../config/typeorm";
import {
  Employee,
  EmploymentStatus,
  MaritalStatus,
  Gender,
} from "../models/entities/employee";
import { ContractType } from "../models/entities/contract";
import { Repository, FindOptionsWhere, ILike, In } from "typeorm";
import { User } from "../models/entities/user";
import { Role } from "../models/entities/role";
import { NotificationType } from "../models/entities/notification";
import { EmployeeDepartment } from "../models/entities/employee-department";
import crypto from "crypto";
import { NotificationService } from "./notification.service";
import nodemailer from "nodemailer";

export interface CreateEmployeeDTO {
  // Basic Information - Only firstName, lastName, email are required
  employeeCode?: string; // Optional - will be auto-generated if not provided
  firstName: string; // Required
  lastName: string; // Required
  middleName?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  nationality?: string;
  nationalId?: string;
  passportNumber?: string;

  // Contact Information
  email: string; // Required
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
  hireDate?: Date;
  confirmationDate?: Date;
  employmentStatus?: EmploymentStatus;
  positionId?: string; // Link to Position entity
  departmentIds?: string[]; // Department IDs for many-to-many relationship
  jobTitle?: string;
  workLocation?: string;
  reportingManagerId?: string;
  suggestedRole?: string; // Role suggested by manager
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
  departmentId?: string; // Filter by department ID (UUID)
  positionId?: string; // Filter by position ID (UUID)
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
  private userRepository: Repository<User>;
  private roleRepository: Repository<Role>;
  private employeeDepartmentRepository: Repository<EmployeeDepartment>;
  private notificationService: NotificationService;
  private transporter: nodemailer.Transporter;

  constructor() {
    this.employeeRepository = AppDataSource.getRepository(Employee);
    this.userRepository = AppDataSource.getRepository(User);
    this.roleRepository = AppDataSource.getRepository(Role);
    this.employeeDepartmentRepository =
      AppDataSource.getRepository(EmployeeDepartment);
    this.notificationService = new NotificationService();

    // Initialize email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
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
      // Note: department and position filtering moved to query builder for relationship support

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

    // Apply department filter first (if provided)
    if (filters?.departmentId) {
      // Filter by department ID through the employeeDepartments relationship
      queryBuilder.where("department.id = :departmentId", {
        departmentId: filters.departmentId,
      });
    }

    // Apply search filter (as AND condition)
    if (filters?.search) {
      queryBuilder.andWhere(
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

    if (filters?.positionId) {
      // Filter by position ID (positionEntity relationship)
      queryBuilder.andWhere("employee.positionId = :positionId", {
        positionId: filters.positionId,
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
      .leftJoin("departments.department", "department")
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
      .leftJoin("departments.department", "department")
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
      .leftJoin("departments.department", "department")
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
  /**
   * Generate a unique employee code
   */
  private async generateEmployeeCode(): Promise<string> {
    // Get the latest employee by created date using query builder
    const lastEmployee = await this.employeeRepository
      .createQueryBuilder("employee")
      .select("employee.employeeCode")
      .orderBy("employee.createdAt", "DESC")
      .limit(1)
      .getOne();

    if (!lastEmployee || !lastEmployee.employeeCode) {
      return "EMP0001";
    }

    // Extract the numeric part and increment
    const match = lastEmployee.employeeCode.match(/EMP(\d+)/);
    if (match) {
      const nextNumber = parseInt(match[1]) + 1;
      return `EMP${nextNumber.toString().padStart(4, "0")}`;
    }

    return "EMP0001";
  }

  /**
   * Generate setup token with 2-week expiry
   */
  private generateSetupToken(): {
    token: string;
    expiry: Date;
  } {
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 14); // 2 weeks from now
    return { token, expiry };
  }

  async createEmployee(data: CreateEmployeeDTO): Promise<Employee> {
    // Generate employee code if not provided
    if (!data.employeeCode) {
      data.employeeCode = await this.generateEmployeeCode();
    } else {
      // Check if provided employee code already exists
      const existingCode = await this.getEmployeeByCode(data.employeeCode);
      if (existingCode) {
        throw new Error(
          `Employee with code ${data.employeeCode} already exists`
        );
      }
    }

    // Check if email already exists in active (non-deleted) employees
    const existingEmail = await this.getEmployeeByEmail(data.email);
    if (existingEmail) {
      throw new Error(`Employee with email ${data.email} already exists`);
    }

    // Check if email exists in soft-deleted employees
    const softDeletedEmployee = await this.employeeRepository.findOne({
      where: { email: data.email },
      withDeleted: true,
    });

    // If soft-deleted employee exists, clean up orphaned user account
    if (softDeletedEmployee && softDeletedEmployee.userId) {
      console.log(
        `Cleaning up orphaned user account from soft-deleted employee: ${data.email}`
      );
      await this.userRepository.delete(softDeletedEmployee.userId);
      
      // Also permanently delete the soft-deleted employee to clean up completely
      await this.employeeRepository.delete(softDeletedEmployee.employeeId);
    }

    // Check for orphaned user with same employeeCode (from previously deleted employee)
    if (data.employeeCode) {
      const userWithCode = await this.userRepository.findOne({
        where: { employeeCode: data.employeeCode },
      });
      
      if (userWithCode) {
        console.log(
          `Cleaning up orphaned user account with employeeCode: ${data.employeeCode}`
        );
        await this.userRepository.delete(userWithCode.userId);
      }
    }

    // Check if email already exists in users (for any remaining edge cases)
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error(`User with email ${data.email} already exists`);
    }

    // Set default values for required fields
    if (!data.hireDate) {
      data.hireDate = new Date();
    }
    if (!data.dateOfBirth) {
      // Set default to 20 years ago if not provided
      const defaultDOB = new Date();
      defaultDOB.setFullYear(defaultDOB.getFullYear() - 20);
      data.dateOfBirth = defaultDOB;
    }

    // Generate setup token
    const { token, expiry } = this.generateSetupToken();

    // Extract departmentIds and other non-entity fields before creating employee
    const { departmentIds, createdBy, ...employeeData } = data;

    // Clean up empty string values for UUID fields
    if (employeeData.positionId === "" || employeeData.positionId === null) {
      delete employeeData.positionId;
    }
    if (
      employeeData.reportingManagerId === "" ||
      employeeData.reportingManagerId === null
    ) {
      delete employeeData.reportingManagerId;
    }
    if (employeeData.userId === "" || employeeData.userId === null) {
      delete employeeData.userId;
    }

    // Create employee with setup token
    const employee = this.employeeRepository.create({
      ...employeeData,
      setupToken: token,
      setupTokenExpiry: expiry,
      hasCompletedSetup: false,
      employmentStatus: data.employmentStatus || EmploymentStatus.INACTIVE, // Inactive until setup complete
    });
    const savedEmployee = await this.employeeRepository.save(employee);

    // Create user account with isActive=false
    const username =
      `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}`.replace(
        /\s+/g,
        ""
      );

    // Generate temporary password (will be reset by user)
    const tempPassword = crypto.randomBytes(16).toString("hex");

    // Find a default employee role (try to find "Employee" role, or any role)
    let defaultRole = await this.roleRepository
      .createQueryBuilder("role")
      .where("LOWER(role.name) LIKE :name", { name: "%employee%" })
      .orWhere("LOWER(role.name) LIKE :name2", { name2: "%user%" })
      .orderBy("role.roleId", "ASC")
      .getOne();

    // If no employee role found, get any role as fallback
    if (!defaultRole) {
      defaultRole = await this.roleRepository
        .createQueryBuilder("role")
        .orderBy("role.roleId", "ASC")
        .getOne();
    }

    // If still no role, throw error - we need at least one role to exist
    if (!defaultRole) {
      throw new Error(
        "No roles found in the system. Please create at least one role before creating employees."
      );
    }

    const user = this.userRepository.create({
      username: username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      passwordHash: tempPassword, // Temporary - user will set their own
      isActive: false,
      isEmailVerified: false,
      employeeCode: savedEmployee.employeeCode,
      roleId: defaultRole.roleId, // Use found default role
    });
    const savedUser = await this.userRepository.save(user);

    // Link user to employee
    savedEmployee.userId = savedUser.userId;
    await this.employeeRepository.save(savedEmployee);

    // Handle department assignments if provided
    if (departmentIds && departmentIds.length > 0) {
      for (let i = 0; i < departmentIds.length; i++) {
        const employeeDepartment = this.employeeDepartmentRepository.create({
          employeeId: savedEmployee.employeeId,
          departmentId: departmentIds[i],
          isPrimary: i === 0, // First department is primary
          isManager: false,
          isActive: true,
        });
        await this.employeeDepartmentRepository.save(employeeDepartment);
      }
    }

    // Send notification to admins (don't let this fail employee creation)
    try {
      await this.notifyAdminsNewEmployee(savedEmployee, data.createdBy);
    } catch (error) {
      console.error("Failed to notify admins, but employee created:", error);
    }

    // Send setup email to employee
    const emailSent = await this.sendSetupEmail(savedEmployee, token);
    if (emailSent) {
      console.log(`Setup email sent to ${data.email}`);
    } else {
      console.warn(`Failed to send setup email to ${data.email}`);
      // Still log the setup link for manual sharing if email fails
      console.log(`Manual setup link: /auth/employee-setup/${token}`);
    }
    console.log(`Token expires: ${expiry}`);

    return savedEmployee;
  }

  /**
   * Notify all admins about new employee creation
   */
  private async notifyAdminsNewEmployee(
    employee: Employee,
    createdBy?: string
  ): Promise<void> {
    try {
      // Find all admin users with proper join conditions
      const adminUsers = await this.userRepository
        .createQueryBuilder("user")
        .innerJoinAndSelect("user.role", "role")
        .innerJoin("role.permissions", "permissions")
        .where("permissions.permission = :permission", {
          permission: "USER_MANAGEMENT",
        })
        .andWhere("permissions.canCreate = :canCreate", { canCreate: true })
        .getMany();

      // Create notification for each admin
      for (const admin of adminUsers) {
        await this.notificationService.createNotification({
          recipientUserId: admin.userId,
          title: "New Employee Created",
          message: `New employee ${employee.firstName} ${employee.lastName} (${
            employee.employeeCode
          }) has been created.${
            employee.suggestedRole
              ? ` Suggested role: ${employee.suggestedRole}`
              : ""
          }`,
          type: NotificationType.INFO,
          sentByUserId: createdBy,
        });
      }
    } catch (error) {
      console.error("Error notifying admins:", error);
      // Don't throw - notification failure shouldn't fail employee creation
    }
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

    // Extract departmentIds before updating
    const { departmentIds, ...employeeData } = data;

    // Update employee basic data
    Object.assign(employee, employeeData);
    const updatedEmployee = await this.employeeRepository.save(employee);

    // Handle department relationships if departmentIds is provided
    if (departmentIds !== undefined) {
      // Remove existing department relationships
      await this.employeeDepartmentRepository.delete({
        employeeId: employee.employeeId,
      });

      // Create new department relationships
      if (departmentIds && departmentIds.length > 0) {
        for (let i = 0; i < departmentIds.length; i++) {
          const employeeDepartment = this.employeeDepartmentRepository.create({
            employeeId: employee.employeeId,
            departmentId: departmentIds[i],
            isPrimary: i === 0, // First department is primary
            isManager: false,
            isActive: true,
          });
          await this.employeeDepartmentRepository.save(employeeDepartment);
        }
      }
    }

    // Return updated employee with relationships
    const refreshedEmployee = await this.getEmployeeById(employeeId);
    if (!refreshedEmployee) {
      throw new Error(`Failed to retrieve updated employee ${employeeId}`);
    }
    return refreshedEmployee;
  }

  /**
   * Soft delete an employee
   */
  async deleteEmployee(employeeId: string): Promise<void> {
    const employee = await this.getEmployeeById(employeeId);
    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    // Soft delete the employee
    await this.employeeRepository.softDelete(employeeId);

    // Deactivate the associated user account if exists
    if (employee.userId) {
      await this.userRepository.update(employee.userId, { isActive: false });
    }
  }

  /**
   * Restore a soft-deleted employee
   */
  async restoreEmployee(employeeId: string): Promise<void> {
    // Restore the employee
    await this.employeeRepository.restore(employeeId);

    // Reactivate the associated user account if exists
    const employee = await this.employeeRepository.findOne({
      where: { employeeId },
    });
    if (employee?.userId) {
      await this.userRepository.update(employee.userId, { isActive: true });
    }
  }

  /**
   * Permanently delete an employee
   */
  async permanentlyDeleteEmployee(employeeId: string): Promise<void> {
    await this.employeeRepository.delete(employeeId);
  }

  /**
   * Validate setup token
   */
  async validateSetupToken(token: string): Promise<{
    valid: boolean;
    employee?: Employee;
    message?: string;
  }> {
    const employee = await this.employeeRepository.findOne({
      where: { setupToken: token },
      relations: ["user"],
    });

    if (!employee) {
      return { valid: false, message: "Invalid setup token" };
    }

    if (!employee.setupTokenExpiry || new Date() > employee.setupTokenExpiry) {
      return { valid: false, message: "Setup token has expired" };
    }

    if (employee.hasCompletedSetup) {
      return {
        valid: false,
        message: "Setup has already been completed for this account",
      };
    }

    return { valid: true, employee };
  }

  /**
   * Complete employee setup - update general information
   */
  async completeEmployeeSetup(
    token: string,
    data: Partial<UpdateEmployeeDTO>
  ): Promise<Employee> {
    const validation = await this.validateSetupToken(token);
    if (!validation.valid || !validation.employee) {
      throw new Error(validation.message || "Invalid setup token");
    }

    const employee = validation.employee;

    // Update employee information
    Object.assign(employee, data);
    employee.hasCompletedSetup = true;
    employee.setupToken = undefined; // Clear token after use
    employee.setupTokenExpiry = undefined;
    employee.employmentStatus = EmploymentStatus.ACTIVE;

    const updatedEmployee = await this.employeeRepository.save(employee);

    // Activate user account
    if (employee.user) {
      employee.user.isActive = true;
      employee.user.isEmailVerified = true;
      await this.userRepository.save(employee.user);
    }

    return updatedEmployee;
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
    departmentId: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<Employee>> {
    return await this.getEmployees(
      pagination || { pageIndex: 0, pageSize: 10 },
      { departmentId }
    );
  }

  /**
   * Get employees in the same department as the manager
   */
  async getEmployeesByManager(
    managerId: string,
    pagination?: PaginationParams,
    search?: string
  ): Promise<PaginatedResponse<Employee>> {
    // First get the manager's employee data to find their department
    const manager = await this.employeeRepository.findOne({
      where: { employeeId: managerId },
      relations: ["departments", "departments.department"],
    });

    if (!manager || !manager.departments || manager.departments.length === 0) {
      const pageIndex = pagination?.pageIndex || 0;
      const pageSize = pagination?.pageSize || 20;
      return {
        data: [],
        total: 0,
        pageIndex,
        pageSize,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      };
    }

    // Get the manager's primary department ID from the EmployeeDepartment junction table
    const departmentId = manager.departments[0].departmentId;

    // Return all employees in the same department
    const result = await this.getEmployees(
      pagination || { pageIndex: 0, pageSize: 100 },
      { departmentId, search }
    );
    return result;
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

  /**
   * Bulk create employees (for import)
   */
  async bulkCreateEmployees(
    employeesData: Partial<CreateEmployeeDTO>[]
  ): Promise<{
    successful: Employee[];
    failed: Array<{ index: number; data: any; error: string }>;
  }> {
    const successful: Employee[] = [];
    const failed: Array<{ index: number; data: any; error: string }> = [];

    for (let i = 0; i < employeesData.length; i++) {
      try {
        const employee = await this.createEmployee(
          employeesData[i] as CreateEmployeeDTO
        );
        successful.push(employee);
      } catch (error: any) {
        failed.push({
          index: i + 2, // +2 because Excel rows start at 2 (after header)
          data: employeesData[i],
          error: error.message || "Unknown error",
        });
      }
    }

    return { successful, failed };
  }

  /**
   * Send setup email to new employee
   */
  async sendSetupEmail(employee: Employee, token: string): Promise<boolean> {
    try {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const setupLink = `${frontendUrl}/auth/employee-setup/${token}`;
      const expiryDays = 14;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: employee.email,
        subject: "Welcome to the Team - Complete Your Profile Setup",
        html: this.getSetupEmailTemplate(
          employee.firstName,
          employee.lastName,
          setupLink,
          expiryDays
        ),
      };

      const result = await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Failed to send setup email:", error);
      return false;
    }
  }

  /**
   * Email template for employee setup
   */
  private getSetupEmailTemplate(
    firstName: string,
    lastName: string,
    setupLink: string,
    expiryDays: number
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin: 0;">Welcome to Our Team!</h1>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Hello ${firstName} ${lastName},</h2>
          
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            We're excited to have you join our organization! To get started, please complete your profile setup by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${setupLink}" 
               style="display: inline-block; background-color: #007bff; color: white; 
                      padding: 15px 40px; text-decoration: none; border-radius: 5px; 
                      font-weight: bold; font-size: 16px;">
              Complete Your Setup
            </a>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              ⏰ <strong>Important:</strong> This setup link will expire in <strong>${expiryDays} days</strong>. 
              Please complete your profile setup before the link expires.
            </p>
          </div>
          
          <div style="margin-top: 25px; padding: 15px; background-color: #e7f3ff; border-left: 4px solid #007bff; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #333;">What you'll need to do:</p>
            <ol style="margin: 0; padding-left: 20px; color: #666;">
              <li style="margin-bottom: 8px;">Create a secure password for your account</li>
              <li style="margin-bottom: 8px;">Complete your personal information</li>
              <li>Review and confirm your employment details</li>
            </ol>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 25px;">
            If you have any questions or need assistance, please don't hesitate to contact our HR department.
          </p>
          
          <p style="font-size: 14px; color: #666; margin-top: 15px;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #007bff; word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
            ${setupLink}
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            This is an automated message from ERP System. Please do not reply to this email.
          </p>
          <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
            © ${new Date().getFullYear()} ERP System. All rights reserved.
          </p>
        </div>
      </div>
    `;
  }
}
