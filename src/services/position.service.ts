import { AppDataSource } from "../config/typeorm";
import { Position, PositionLevel } from "../models/entities/position";
import { Employee, EmploymentStatus } from "../models/entities/employee";
import { FindOptionsWhere, ILike, IsNull } from "typeorm";

export class PositionService {
  private positionRepository = AppDataSource.getRepository(Position);
  private employeeRepository = AppDataSource.getRepository(Employee);

  /**
   * Get all positions with optional filters
   */
  async getAllPositions(filters?: {
    isActive?: boolean;
    level?: PositionLevel;
    search?: string;
    parentId?: string | null;
    minSalary?: number;
    maxSalary?: number;
  }) {
    const where: FindOptionsWhere<Position> = {};

    // Default to only active positions unless explicitly specified
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    } else {
      where.isActive = true;
    }

    if (filters?.level) {
      where.level = filters.level;
    }

    if (filters?.search) {
      // For search, we'll use OR conditions
      return this.positionRepository.find({
        where: [
          { ...where, name: ILike(`%${filters.search}%`) },
          { ...where, code: ILike(`%${filters.search}%`) },
          { ...where, description: ILike(`%${filters.search}%`) },
        ],
        relations: ["parentPosition", "subPositions", "employees"],
        order: { name: "ASC" },
      });
    }

    if (filters?.parentId !== undefined) {
      where.parentId = filters.parentId === null ? IsNull() : filters.parentId;
    }

    const positions = await this.positionRepository.find({
      where,
      relations: ["parentPosition", "subPositions", "employees"],
      order: { name: "ASC" },
    });

    // Filter by salary range if provided
    if (filters?.minSalary !== undefined || filters?.maxSalary !== undefined) {
      return positions.filter((pos) => {
        if (
          filters.minSalary &&
          pos.minSalary &&
          pos.minSalary < filters.minSalary
        ) {
          return false;
        }
        if (
          filters.maxSalary &&
          pos.maxSalary &&
          pos.maxSalary > filters.maxSalary
        ) {
          return false;
        }
        return true;
      });
    }

    return positions;
  }

  /**
   * Get position by ID
   */
  async getPositionById(id: string) {
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

  /**
   * Get position hierarchy (tree structure)
   */
  async getPositionHierarchy() {
    // Get all top-level positions (no parent)
    const topLevelPositions = await this.positionRepository.find({
      where: { parentId: IsNull(), isActive: true },
      relations: ["subPositions"],
      order: { name: "ASC" },
    });

    // Recursively load sub-positions
    const loadSubPositions = async (position: Position): Promise<Position> => {
      if (position.subPositions && position.subPositions.length > 0) {
        position.subPositions = await Promise.all(
          position.subPositions.map(async (subPos) => {
            const fullSubPos = await this.positionRepository.findOne({
              where: { id: subPos.id },
              relations: ["subPositions"],
            });
            if (fullSubPos) {
              return loadSubPositions(fullSubPos);
            }
            return subPos;
          })
        );
      }
      return position;
    };

    return Promise.all(topLevelPositions.map((pos) => loadSubPositions(pos)));
  }

  /**
   * Create a new position
   */
  async createPosition(data: {
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
  }) {
    // Validate parent position exists if parentId is provided
    if (data.parentId) {
      const parentPosition = await this.positionRepository.findOne({
        where: { id: data.parentId },
      });
      if (!parentPosition) {
        throw new Error("Parent position not found");
      }
    }

    // Validate salary range
    if (data.minSalary && data.maxSalary && data.minSalary > data.maxSalary) {
      throw new Error("Minimum salary cannot be greater than maximum salary");
    }

    // Check if position code already exists
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

  /**
   * Update position
   */
  async updatePosition(
    id: string,
    data: {
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
    }
  ) {
    const position = await this.getPositionById(id);

    // Prevent circular reference in parent-child relationship
    if (data.parentId && data.parentId === id) {
      throw new Error("Position cannot be its own parent");
    }

    // Validate parent position exists if parentId is provided
    if (data.parentId && data.parentId !== position.parentId) {
      const parentPosition = await this.positionRepository.findOne({
        where: { id: data.parentId },
      });
      if (!parentPosition) {
        throw new Error("Parent position not found");
      }

      // Check if new parent is a descendant of this position
      const isDescendant = await this.isDescendant(data.parentId, position.id);
      if (isDescendant) {
        throw new Error("Cannot set a descendant position as parent");
      }
    }

    // Validate salary range
    const newMinSalary = data.minSalary ?? position.minSalary;
    const newMaxSalary = data.maxSalary ?? position.maxSalary;
    if (newMinSalary && newMaxSalary && newMinSalary > newMaxSalary) {
      throw new Error("Minimum salary cannot be greater than maximum salary");
    }

    // Check if position code already exists (if being changed)
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

  /**
   * Delete position (soft delete by setting isActive to false)
   */
  async deletePosition(id: string, deletedBy?: string) {
    const position = await this.getPositionById(id);

    // Check if position has active sub-positions
    const activeSubPositions = await this.positionRepository.count({
      where: { parentId: id, isActive: true },
    });

    if (activeSubPositions > 0) {
      throw new Error(
        "Cannot delete position with active sub-positions. Please delete or move sub-positions first."
      );
    }

    // Check if position has active employees
    const activeEmployees = await this.employeeRepository.count({
      where: { positionId: id, employmentStatus: EmploymentStatus.ACTIVE },
    });

    if (activeEmployees > 0) {
      throw new Error(
        "Cannot delete position with active employees. Please reassign employees first."
      );
    }

    position.isActive = false;
    position.updatedBy = deletedBy;
    return this.positionRepository.save(position);
  }

  /**
   * Permanently delete position (hard delete)
   */
  async hardDeletePosition(id: string) {
    const position = await this.getPositionById(id);

    // Check if position has any sub-positions
    const subPositions = await this.positionRepository.count({
      where: { parentId: id },
    });

    if (subPositions > 0) {
      throw new Error("Cannot permanently delete position with sub-positions");
    }

    // Check if position has any employees
    const employees = await this.employeeRepository.count({
      where: { positionId: id },
    });

    if (employees > 0) {
      throw new Error("Cannot permanently delete position with employees");
    }

    await this.positionRepository.remove(position);
    return { message: "Position permanently deleted" };
  }

  /**
   * Get employees in a position
   */
  async getPositionEmployees(positionId: string, activeOnly: boolean = true) {
    const where: FindOptionsWhere<Employee> = {
      positionId,
    };

    if (activeOnly) {
      where.employmentStatus = EmploymentStatus.ACTIVE;
    }

    return this.employeeRepository.find({
      where,
      relations: ["user", "departments", "positionEntity"],
      order: { hireDate: "DESC" },
    });
  }

  /**
   * Get position statistics
   */
  async getPositionStats(positionId: string) {
    const position = await this.getPositionById(positionId);

    const totalEmployees = await this.employeeRepository.count({
      where: { positionId },
    });

    const activeEmployees = await this.employeeRepository.count({
      where: { positionId, employmentStatus: EmploymentStatus.ACTIVE },
    });

    const subPositionsCount = await this.positionRepository.count({
      where: { parentId: positionId, isActive: true },
    });

    // Update headcount
    position.headcount = activeEmployees;
    await this.positionRepository.save(position);

    return {
      position,
      totalEmployees,
      activeEmployees,
      subPositionsCount,
    };
  }

  /**
   * Check if a position is a descendant of another
   */
  private async isDescendant(
    possibleDescendantId: string,
    ancestorId: string
  ): Promise<boolean> {
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

  /**
   * Get positions by level
   */
  async getPositionsByLevel(level: PositionLevel) {
    return this.positionRepository.find({
      where: { level, isActive: true },
      relations: ["employees"],
      order: { name: "ASC" },
    });
  }

  /**
   * Get positions within salary range
   */
  async getPositionsBySalaryRange(minSalary: number, maxSalary: number) {
    const allPositions = await this.positionRepository.find({
      where: { isActive: true },
      order: { minSalary: "ASC" },
    });

    return allPositions.filter((pos) => {
      if (!pos.minSalary || !pos.maxSalary) {
        return false;
      }
      // Position overlaps with the search range
      return pos.maxSalary >= minSalary && pos.minSalary <= maxSalary;
    });
  }

  /**
   * Update headcount for all positions
   */
  async updateAllHeadcounts() {
    const positions = await this.positionRepository.find({
      where: { isActive: true },
    });

    const updates = await Promise.all(
      positions.map(async (position) => {
        const activeEmployees = await this.employeeRepository.count({
          where: {
            positionId: position.id,
            employmentStatus: EmploymentStatus.ACTIVE,
          },
        });

        position.headcount = activeEmployees;
        return this.positionRepository.save(position);
      })
    );

    return {
      message: "Updated headcount for all positions",
      updatedCount: updates.length,
    };
  }
}
