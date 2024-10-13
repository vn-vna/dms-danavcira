import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ApplicationAuthorizationState {
  token?: string;
}

export const authorizationSlice = createSlice({
  name: "authorization",
  initialState: {} as ApplicationAuthorizationState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    ckearToken: (state) => {
      state.token = undefined;
    }
  }
})

export const { setToken } = authorizationSlice.actions;