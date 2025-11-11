import { AppDataSource } from "../config/typeorm";
import { Department, DepartmentType } from "../models/entities/department";
import { EmployeeDepartment } from "../models/entities/employee-department";
import { FindOptionsWhere, ILike, IsNull } from "typeorm";

export class DepartmentService {
  private departmentRepository = AppDataSource.getRepository(Department);
  private employeeDepartmentRepository =
    AppDataSource.getRepository(EmployeeDepartment);

  /**
   * Get all departments with optional filters
   */
  async getAllDepartments(filters?: {
    isActive?: boolean;
    type?: DepartmentType;
    search?: string;
    parentId?: string | null;
  }) {
    const where: FindOptionsWhere<Department> = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.search) {
      // For search, we'll use OR conditions
      return this.departmentRepository.find({
        where: [
          { ...where, name: ILike(`%${filters.search}%`) },
          { ...where, code: ILike(`%${filters.search}%`) },
          { ...where, description: ILike(`%${filters.search}%`) },
        ],
        relations: ["parentDepartment", "subDepartments", "employees"],
        order: { name: "ASC" },
      });
    }

    if (filters?.parentId !== undefined) {
      where.parentId = filters.parentId === null ? IsNull() : filters.parentId;
    }

    return this.departmentRepository.find({
      where,
      relations: ["parentDepartment", "subDepartments", "employees"],
      order: { name: "ASC" },
    });
  }

  /**
   * Get department by ID
   */
  async getDepartmentById(id: string) {
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

  /**
   * Get department hierarchy (tree structure)
   */
  async getDepartmentHierarchy() {
    // Get all top-level departments (no parent)
    const topLevelDepartments = await this.departmentRepository.find({
      where: { parentId: IsNull(), isActive: true },
      relations: ["subDepartments"],
      order: { name: "ASC" },
    });

    // Recursively load sub-departments
    const loadSubDepartments = async (
      department: Department
    ): Promise<Department> => {
      if (department.subDepartments && department.subDepartments.length > 0) {
        department.subDepartments = await Promise.all(
          department.subDepartments.map(async (subDept) => {
            const fullSubDept = await this.departmentRepository.findOne({
              where: { id: subDept.id },
              relations: ["subDepartments"],
            });
            if (fullSubDept) {
              return loadSubDepartments(fullSubDept);
            }
            return subDept;
          })
        );
      }
      return department;
    };

    return Promise.all(
      topLevelDepartments.map((dept) => loadSubDepartments(dept))
    );
  }

  /**
   * Create a new department
   */
  async createDepartment(data: {
    name: string;
    description?: string;
    parentId?: string;
    type: DepartmentType;
    code?: string;
    location?: string;
    managerId?: string;
    budget?: string;
    createdBy?: string;
  }) {
    // Validate parent department exists if parentId is provided
    if (data.parentId) {
      const parentDepartment = await this.departmentRepository.findOne({
        where: { id: data.parentId },
      });
      if (!parentDepartment) {
        throw new Error("Parent department not found");
      }
    }

    // Check if department code already exists
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

  /**
   * Update department
   */
  async updateDepartment(
    id: string,
    data: {
      name?: string;
      description?: string;
      parentId?: string;
      type?: DepartmentType;
      code?: string;
      location?: string;
      managerId?: string;
      budget?: string;
      isActive?: boolean;
      updatedBy?: string;
    }
  ) {
    const department = await this.getDepartmentById(id);

    // Prevent circular reference in parent-child relationship
    if (data.parentId && data.parentId === id) {
      throw new Error("Department cannot be its own parent");
    }

    // Validate parent department exists if parentId is provided
    if (data.parentId && data.parentId !== department.parentId) {
      const parentDepartment = await this.departmentRepository.findOne({
        where: { id: data.parentId },
      });
      if (!parentDepartment) {
        throw new Error("Parent department not found");
      }

      // Check if new parent is a descendant of this department
      const isDescendant = await this.isDescendant(
        data.parentId,
        department.id
      );
      if (isDescendant) {
        throw new Error("Cannot set a descendant department as parent");
      }
    }

    // Check if department code already exists (if being changed)
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

  /**
   * Delete department (soft delete by setting isActive to false)
   */
  async deleteDepartment(id: string, deletedBy?: string) {
    const department = await this.getDepartmentById(id);

    // Check if department has active sub-departments
    const activeSubDepartments = await this.departmentRepository.count({
      where: { parentId: id, isActive: true },
    });

    if (activeSubDepartments > 0) {
      throw new Error(
        "Cannot delete department with active sub-departments. Please delete or move sub-departments first."
      );
    }

    // Check if department has active employees
    const activeEmployees = await this.employeeDepartmentRepository.count({
      where: { departmentId: id, isActive: true },
    });

    if (activeEmployees > 0) {
      throw new Error(
        "Cannot delete department with active employees. Please move employees first."
      );
    }

    department.isActive = false;
    department.updatedBy = deletedBy;
    return this.departmentRepository.save(department);
  }

  /**
   * Permanently delete department (hard delete)
   */
  async hardDeleteDepartment(id: string) {
    const department = await this.getDepartmentById(id);

    // Check if department has any sub-departments
    const subDepartments = await this.departmentRepository.count({
      where: { parentId: id },
    });

    if (subDepartments > 0) {
      throw new Error(
        "Cannot permanently delete department with sub-departments"
      );
    }

    // Check if department has any employee associations
    const employeeAssociations = await this.employeeDepartmentRepository.count({
      where: { departmentId: id },
    });

    if (employeeAssociations > 0) {
      throw new Error(
        "Cannot permanently delete department with employee associations"
      );
    }

    await this.departmentRepository.remove(department);
    return { message: "Department permanently deleted" };
  }

  /**
   * Get employees in a department
   */
  async getDepartmentEmployees(
    departmentId: string,
    includeInactive: boolean = false
  ) {
    const where: FindOptionsWhere<EmployeeDepartment> = {
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

  /**
   * Get department statistics
   */
  async getDepartmentStats(departmentId: string) {
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

  /**
   * Check if a department is a descendant of another
   */
  private async isDescendant(
    possibleDescendantId: string,
    ancestorId: string
  ): Promise<boolean> {
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

  /**
   * Move employees from one department to another
   */
  async moveEmployees(
    fromDepartmentId: string,
    toDepartmentId: string,
    employeeIds?: string[]
  ) {
    // Validate both departments exist
    await this.getDepartmentById(fromDepartmentId);
    await this.getDepartmentById(toDepartmentId);

    const where: FindOptionsWhere<EmployeeDepartment> = {
      departmentId: fromDepartmentId,
      isActive: true,
    };

    // If specific employee IDs provided, only move those
    const employeeDepartments = employeeIds
      ? await this.employeeDepartmentRepository.find({
          where: employeeIds.map((empId) => ({
            ...where,
            employeeId: empId,
          })),
        })
      : await this.employeeDepartmentRepository.find({ where });

    // Update department ID for all selected employees
    const movedEmployees = await Promise.all(
      employeeDepartments.map(async (empDept) => {
        empDept.departmentId = toDepartmentId;
        empDept.isPrimary = false; // Reset primary flag, let user set it manually
        return this.employeeDepartmentRepository.save(empDept);
      })
    );

    return {
      message: `Moved ${movedEmployees.length} employees`,
      movedCount: movedEmployees.length,
    };
  }
}
