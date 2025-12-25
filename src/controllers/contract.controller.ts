import { Response } from "express";
import { ContractService } from "../services/contract.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { ContractStatus } from "../models/entities/contract";

export class ContractController {
  private contractService: ContractService;

  constructor() {
    this.contractService = new ContractService();
  }

  /**
   * Get all contracts with pagination and filtering
   * GET /api/contracts?pageIndex=0&pageSize=10&sortBy=createdAt&sortOrder=DESC&contractType=FULL_TIME&workingType=REMOTE&status=ACTIVE
   */
  getContracts = async (req: AuthRequest, res: Response) => {
    try {
      const pageIndex = parseInt(req.query.pageIndex as string) || 0;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const sortBy = (req.query.sortBy as string) || "createdAt";
      const sortOrder = (req.query.sortOrder as "ASC" | "DESC") || "DESC";

      const filters = {
        contractType: req.query.contractType as string,
        workingType: req.query.workingType as string,
        status: req.query.status as ContractStatus,
        employeeId: req.query.employeeId as string,
      };

      const result = await this.contractService.getContracts(
        pageIndex,
        pageSize,
        sortBy,
        sortOrder,
        filters
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch contracts",
        error: error.message,
      });
    }
  };

  /**
   * Get contract by ID
   * GET /api/contracts/:id
   */
  getContractById = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const contract = await this.contractService.getContractById(id);

      res.status(200).json({
        success: true,
        contract,
      });
    } catch (error: any) {
      console.error("Error fetching contract:", error);
      res.status(404).json({
        success: false,
        message: error.message || "Contract not found",
      });
    }
  };

  /**
   * Get contracts by employee ID
   * GET /api/contracts/employee/:employeeId
   */
  getContractsByEmployeeId = async (req: AuthRequest, res: Response) => {
    try {
      const { employeeId } = req.params;
      const contracts = await this.contractService.getContractsByEmployeeId(
        employeeId
      );

      res.status(200).json({
        success: true,
        contracts,
        count: contracts.length,
      });
    } catch (error: any) {
      console.error("Error fetching employee contracts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch employee contracts",
        error: error.message,
      });
    }
  };

  /**
   * Get expiring contracts
   * GET /api/contracts/expiring?days=30&contractType=FULL_TIME&workingType=REMOTE
   */
  getExpiringContracts = async (req: AuthRequest, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const filters = {
        contractType: req.query.contractType as string,
        workingType: req.query.workingType as string,
      };

      const contracts = await this.contractService.getExpiringContracts(
        days,
        filters
      );

      res.status(200).json({
        success: true,
        data: contracts,
        count: contracts.length,
      });
    } catch (error: any) {
      console.error("Error fetching expiring contracts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch expiring contracts",
        error: error.message,
      });
    }
  };

  /**
   * Create a new contract
   * POST /api/contracts
   */
  createContract = async (req: AuthRequest, res: Response) => {
    try {
      const contractData = req.body;
      contractData.createdBy = req.user?.email;

      const contract = await this.contractService.createContract(contractData);

      res.status(201).json({
        success: true,
        message: "Contract created successfully",
        contract,
      });
    } catch (error: any) {
      console.error("Error creating contract:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create contract",
      });
    }
  };

  /**
   * Update contract
   * PUT /api/contracts/:id
   */
  updateContract = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const contractData = req.body;
      contractData.updatedBy = req.user?.email;

      const contract = await this.contractService.updateContract(
        id,
        contractData
      );

      res.status(200).json({
        success: true,
        message: "Contract updated successfully",
        contract,
      });
    } catch (error: any) {
      console.error("Error updating contract:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update contract",
      });
    }
  };

  /**
   * Delete contract (soft delete)
   * DELETE /api/contracts/:id
   */
  deleteContract = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const result = await this.contractService.deleteContract(id);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error("Error deleting contract:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to delete contract",
      });
    }
  };

  /**
   * Get contract statistics
   * GET /api/contracts/statistics
   */
  getStatistics = async (req: AuthRequest, res: Response) => {
    try {
      const stats = await this.contractService.getContractStatistics();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error("Error fetching contract statistics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch contract statistics",
        error: error.message,
      });
    }
  };
}
