import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  getPositionList,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition,
} from "../../services/position.service";

export interface Position {
  id: string;
  name: string;
  code?: string;
  description?: string;
  level?: string;
  parentId?: string;
  minSalary?: number;
  maxSalary?: number;
  salaryCurrency?: string;
  requirements?: string;
  responsibilities?: string;
  isActive: boolean;
  headcount?: number;
  employees?: any[];
  subPositions?: Position[];
  parentPosition?: Position;
}

export type PositionState = {
  positions: Position[];
  selectedPosition: Position | null;
  totalCount?: number;
  success: boolean;
  isLoading: boolean;
  error?: string;
};

export const initPositionState: PositionState = {
  positions: [],
  selectedPosition: null,
  success: false,
  isLoading: false,
  error: undefined,
};

export const positionSlice = createSlice({
  name: "position",
  initialState: initPositionState,
  reducers: {
    clearSelectedPosition: (state) => {
      state.selectedPosition = null;
    },
    clearError: (state) => {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get position list
      .addCase(getPositionList.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(getPositionList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.positions = action.payload.data || action.payload;
        state.totalCount = action.payload?.count || action.payload?.length;
        state.success = true;
      })
      .addCase(getPositionList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      })

      // Get position by ID
      .addCase(getPositionById.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(getPositionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedPosition = action.payload.data;
        state.success = true;
      })
      .addCase(getPositionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      })

      // Create position
      .addCase(createPosition.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(createPosition.fulfilled, (state, action) => {
        state.isLoading = false;
        state.positions.push(action.payload.data);
        state.success = true;
      })
      .addCase(createPosition.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      })

      // Update position
      .addCase(updatePosition.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(updatePosition.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.positions.findIndex(
          (p) => p.id === action.payload.data.id
        );
        if (index !== -1) {
          state.positions[index] = action.payload.data;
        }
        state.success = true;
      })
      .addCase(updatePosition.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      })

      // Delete position
      .addCase(deletePosition.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(deletePosition.fulfilled, (state, action) => {
        state.isLoading = false;
        state.positions = state.positions.filter(
          (p) => p.id !== action.payload.positionId
        );
        state.success = true;
      })
      .addCase(deletePosition.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      });
  },
});

export const { clearSelectedPosition, clearError } = positionSlice.actions;

export const selectPosition = (state: RootState) => state.position;

export default positionSlice.reducer;
