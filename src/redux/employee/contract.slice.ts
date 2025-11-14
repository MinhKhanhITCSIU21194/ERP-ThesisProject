import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  getContractList,
  getContractsByEmployeeId,
  getExpiringContracts,
} from "../../services/contract.service";
import { Contract } from "../../data/employer/contract";

export type ContractState = {
  contracts: Contract[];
  selectedContracts: Contract[];
  totalCount: number;
  success: boolean;
  isLoading: boolean;
  error?: string;
};

export const initContractState: ContractState = {
  success: false,
  contracts: [],
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
    clearError: (state) => {
      state.error = undefined;
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
      });
  },
});

export const { clearSelectedContracts, clearError } = contractSlice.actions;

export const selectContract = (state: RootState) => state.contract;

export default contractSlice.reducer;
