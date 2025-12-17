"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractController = void 0;
const contract_service_1 = require("../services/contract.service");
class ContractController {
    constructor() {
        this.getContracts = async (req, res) => {
            try {
                const pageIndex = parseInt(req.query.pageIndex) || 0;
                const pageSize = parseInt(req.query.pageSize) || 10;
                const sortBy = req.query.sortBy || "createdAt";
                const sortOrder = req.query.sortOrder || "DESC";
                const filters = {
                    contractType: req.query.contractType,
                    workingType: req.query.workingType,
                    status: req.query.status,
                    employeeId: req.query.employeeId,
                };
                const result = await this.contractService.getContracts(pageIndex, pageSize, sortBy, sortOrder, filters);
                res.status(200).json({
                    success: true,
                    ...result,
                });
            }
            catch (error) {
                console.error("Error fetching contracts:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch contracts",
                    error: error.message,
                });
            }
        };
        this.getContractById = async (req, res) => {
            try {
                const { id } = req.params;
                const contract = await this.contractService.getContractById(id);
                res.status(200).json({
                    success: true,
                    contract,
                });
            }
            catch (error) {
                console.error("Error fetching contract:", error);
                res.status(404).json({
                    success: false,
                    message: error.message || "Contract not found",
                });
            }
        };
        this.getContractsByEmployeeId = async (req, res) => {
            try {
                const { employeeId } = req.params;
                const contracts = await this.contractService.getContractsByEmployeeId(employeeId);
                res.status(200).json({
                    success: true,
                    contracts,
                    count: contracts.length,
                });
            }
            catch (error) {
                console.error("Error fetching employee contracts:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch employee contracts",
                    error: error.message,
                });
            }
        };
        this.getExpiringContracts = async (req, res) => {
            try {
                const days = parseInt(req.query.days) || 30;
                const filters = {
                    contractType: req.query.contractType,
                    workingType: req.query.workingType,
                };
                const contracts = await this.contractService.getExpiringContracts(days, filters);
                res.status(200).json({
                    success: true,
                    data: contracts,
                    count: contracts.length,
                });
            }
            catch (error) {
                console.error("Error fetching expiring contracts:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch expiring contracts",
                    error: error.message,
                });
            }
        };
        this.createContract = async (req, res) => {
            try {
                const contractData = req.body;
                contractData.createdBy = req.user?.email;
                const contract = await this.contractService.createContract(contractData);
                res.status(201).json({
                    success: true,
                    message: "Contract created successfully",
                    contract,
                });
            }
            catch (error) {
                console.error("Error creating contract:", error);
                res.status(400).json({
                    success: false,
                    message: error.message || "Failed to create contract",
                });
            }
        };
        this.updateContract = async (req, res) => {
            try {
                const { id } = req.params;
                const contractData = req.body;
                contractData.updatedBy = req.user?.email;
                const contract = await this.contractService.updateContract(id, contractData);
                res.status(200).json({
                    success: true,
                    message: "Contract updated successfully",
                    contract,
                });
            }
            catch (error) {
                console.error("Error updating contract:", error);
                res.status(400).json({
                    success: false,
                    message: error.message || "Failed to update contract",
                });
            }
        };
        this.deleteContract = async (req, res) => {
            try {
                const { id } = req.params;
                const result = await this.contractService.deleteContract(id);
                res.status(200).json({
                    success: true,
                    ...result,
                });
            }
            catch (error) {
                console.error("Error deleting contract:", error);
                res.status(400).json({
                    success: false,
                    message: error.message || "Failed to delete contract",
                });
            }
        };
        this.getStatistics = async (req, res) => {
            try {
                const stats = await this.contractService.getContractStatistics();
                res.status(200).json({
                    success: true,
                    data: stats,
                });
            }
            catch (error) {
                console.error("Error fetching contract statistics:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch contract statistics",
                    error: error.message,
                });
            }
        };
        this.contractService = new contract_service_1.ContractService();
    }
}
exports.ContractController = ContractController;
//# sourceMappingURL=contract.controller.js.map