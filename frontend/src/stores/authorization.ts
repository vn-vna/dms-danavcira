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

export interface ApplicationAuthorizationState {
  token?: string;
  role?: UserRole;
  branch_id?: string;
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
    }
  }
})

export const {
  setToken, setRole, clearToken, clearRole, setBranchId, clearBranchId
} = authorizationSlice.actions;