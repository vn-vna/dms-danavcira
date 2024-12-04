import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export enum UserRole {
  SystemAdministrator = 0,
  GeneralManager = 1,
  BranchManager = 2,
  SaleManager = 3,
  Officer = 4,
  Staff = 5,
  Customer = 6,
}

export function roleToString(role: UserRole) {
  switch (role) {
    case UserRole.SystemAdministrator:
      return "System Administrator";
    case UserRole.GeneralManager:
      return "General Manager";
    case UserRole.BranchManager:
      return "Branch Manager";
    case UserRole.SaleManager:
      return "Sale Manager";
    case UserRole.Officer:
      return "Officer";
    case UserRole.Staff:
      return "Staff";
    case UserRole.Customer:
      return "Customer";
    default:
      return "Unknown";
  }
}

export interface ApplicationAuthorizationState {
  token?: string;
  role?: UserRole;
  branch_id?: string;
  uid?: string;
}

export const authorizationSlice = createSlice({
  name: "authorization",
  initialState: {} as ApplicationAuthorizationState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    clearToken: (state) => {
      state.token = undefined;
    },
    setRole: (state, action: PayloadAction<UserRole>) => {
      state.role = action.payload;
    },
    clearRole: (state) => {
      state.role = undefined;
    },
    setBranchId: (state, action: PayloadAction<string>) => {
      state.branch_id = action.payload;
    },
    clearBranchId: (state) => {
      state.branch_id = undefined;
    },
    setUid: (state, action: PayloadAction<string>) => {
      state.uid = action.payload;
    },
    clearUid: (state) => {
      state.uid = undefined;
    },
  }
})

export const {
  setToken, setRole, clearToken, clearRole, setBranchId, clearBranchId,
  setUid, clearUid
} = authorizationSlice.actions;