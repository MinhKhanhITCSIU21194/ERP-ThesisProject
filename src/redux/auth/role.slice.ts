import { createSlice } from "@reduxjs/toolkit";
import { Role, Permission } from "../../data/auth/role";
import { RootState } from "../store";
import {
  getRoleList,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions,
} from "../../services/auth/role.service";

export type RoleState = {
  roles: Role[];
  selectedRole: Role | null;
  permissions: Permission[];
  totalCount: number;
  success: boolean;
  isLoading: boolean;
  error?: string;
};

export const initRoleState: RoleState = {
  success: false,
  roles: [],
  selectedRole: null,
  permissions: [],
  error: undefined,
  isLoading: false,
  totalCount: 0,
};

export const roleSlice = createSlice({
  name: "role",
  initialState: initRoleState,
  reducers: {
    clearSelectedRole: (state) => {
      state.selectedRole = null;
    },
    clearError: (state) => {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get role list
      .addCase(getRoleList.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(getRoleList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles = action.payload.data;
        state.totalCount = action.payload.totalCount;
        state.success = true;
      })
      .addCase(getRoleList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      })

      // Get role by ID
      .addCase(getRoleById.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(getRoleById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedRole = action.payload.data;
        state.success = true;
      })
      .addCase(getRoleById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      })

      // Create role
      .addCase(createRole.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles.push(action.payload.data);
        state.totalCount += 1;
        state.success = true;
      })
      .addCase(createRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      })

      // Update role
      .addCase(updateRole.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.roles.findIndex(
          (r) => r.id === action.payload.data.id
        );
        if (index !== -1) {
          state.roles[index] = action.payload.data;
        }
        state.success = true;
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      })

      // Delete role
      .addCase(deleteRole.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles = state.roles.filter((r) => r.id !== action.payload.roleId);
        state.totalCount -= 1;
        state.success = true;
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      })

      // Get all permissions
      .addCase(getAllPermissions.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(getAllPermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.permissions = action.payload.data;
        state.success = true;
      })
      .addCase(getAllPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      });
  },
});

export const { clearSelectedRole, clearError } = roleSlice.actions;

export const selectRole = (state: RootState) => state.role;

export default roleSlice.reducer;
