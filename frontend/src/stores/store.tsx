import { configureStore } from "@reduxjs/toolkit";
import { authorizationSlice } from "./authorization";

const store = configureStore({
  reducer: {
    authorization: authorizationSlice.reducer
  },
});


export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

export default store;