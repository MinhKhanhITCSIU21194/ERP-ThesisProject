import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  getContractList,
  getContractById,
  getContractsByEmployeeId,
  getExpiringContracts,
  createContract,
  updateContract,
  deleteContract,
} from "../../services/contract.service";
import { Contract } from "../../data/employer/contract";

export type ContractState = {
  contracts: Contract[];
  selectedContract: Contract | null;
  selectedContracts: Contract[];
  totalCount: number;
  success: boolean;
  isLoading: boolean;
  error?: string;
};

export const initContractState: ContractState = {
  success: false,
  contracts: [],
  selectedContract: null,
  selectedContracts: [],
  error: undefined,
  isLoading: false,
  totalCount: 0,
};

export const contractSlice = createSlice({
  name: "contract",
  initialState: initContractState,
  reducers: {
    clearSelectedContracts: (state) => {
      state.selectedContracts = [];
    },
    clearSelectedContract: (state) => {
      state.selectedContract = null;
    },
    clearError: (state) => {
      state.error = undefined;
    },
    setSelectedContract: (state, action) => {
      state.selectedContract = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get contract list
      .addCase(getContractList.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(getContractList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contracts = action.payload.contracts || [];
        state.totalCount = action.payload?.totalCount || 0;
        state.contracts.map((contract) => {
          contract.employeeFullName = action.payload.employee.name;
        });
        state.success = true;
      })
      .addCase(getContractList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      // Get contracts by employee ID
      .addCase(getContractsByEmployeeId.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(getContractsByEmployeeId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contracts = action.payload.contracts || [];
        // Employee info is already included in each contract via relations
        state.contracts.forEach((contract) => {
          if (contract.employee) {
            contract.employeeFullName = `${contract.employee.fullName} ${contract.employee.lastName}`;
          }
        });

        state.totalCount = action.payload?.count || 0;
        state.success = true;
      })
      .addCase(getContractsByEmployeeId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      // Get expiring contracts
      .addCase(getExpiringContracts.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(getExpiringContracts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contracts = action.payload.data || [];
        state.totalCount = action.payload?.count || 0;
        state.success = true;
      })
      .addCase(getExpiringContracts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      // Get contract by ID
      .addCase(getContractById.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(getContractById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedContract = action.payload.contract;
        state.success = true;
      })
      .addCase(getContractById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      // Create contract
      .addCase(createContract.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(createContract.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contracts = [...state.contracts, action.payload.contract];
        state.totalCount += 1;
        state.success = true;
      })
      .addCase(createContract.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      // Update contract
      .addCase(updateContract.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(updateContract.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedContract = action.payload.contract;
        state.contracts = state.contracts.map((contract) =>
          contract.id === updatedContract.id ? updatedContract : contract
        );
        if (state.selectedContract?.id === updatedContract.id) {
          state.selectedContract = updatedContract;
        }
        state.success = true;
      })
      .addCase(updateContract.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      // Delete contract
      .addCase(deleteContract.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(deleteContract.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove from contracts list (assuming the payload contains the deleted contract ID)
        const deletedId = action.meta.arg; // The ID passed to the thunk
        state.contracts = state.contracts.filter(
          (contract) => contract.id !== deletedId
        );
        state.totalCount -= 1;
        if (state.selectedContract?.id === deletedId) {
          state.selectedContract = null;
        }
        state.success = true;
      })
      .addCase(deleteContract.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      });
  },
});

export const {
  clearSelectedContracts,
  clearSelectedContract,
  clearError,
  setSelectedContract,
} = contractSlice.actions;

export const selectContract = (state: RootState) => state.contract;

export default contractSlice.reducer;
