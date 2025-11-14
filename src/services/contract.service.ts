import { createAsyncThunk } from "@reduxjs/toolkit";
import { TableFilterState } from "../redux/store";
import { GET } from "./axios";

export interface ContractFilterParams extends TableFilterState {
  contractType?: string;
  workingType?: string;
}

export const getContractList = createAsyncThunk(
  "contract/get-employee-contract-list",
  async (params: ContractFilterParams, { rejectWithValue }) => {
    try {
      const response = await GET("/contracts", { params });
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch contracts";
      return rejectWithValue(message);
    }
  }
);

/**
 * Get contracts for a specific employee by ID
 * @param id - Employee ID
 * @param params - Optional filter parameters including contractType and workingType
 */
export const getContractsByEmployeeId = createAsyncThunk(
  "contract/get-contracts-by-employee-id",
  async (
    { id, params }: { id: string; params?: ContractFilterParams },
    { rejectWithValue }
  ) => {
    try {
      const response = await GET(`/contracts/employee/${id}`, { params });
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch employee contracts";
      return rejectWithValue(message);
    }
  }
);

/**
 * Get contracts that are nearly expired
 * @param days - Number of days threshold (default: 30)
 * @param contractType - Optional filter by contract type
 * @param workingType - Optional filter by working type
 */
export const getExpiringContracts = createAsyncThunk(
  "contract/get-expiring-contracts",
  async (
    {
      days = 30,
      contractType,
      workingType,
    }: { days?: number; contractType?: string; workingType?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const params: any = { days };
      if (contractType) params.contractType = contractType;
      if (workingType) params.workingType = workingType;

      const response = await GET("/contracts/expiring", { params });
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch expiring contracts";
      return rejectWithValue(message);
    }
  }
);
