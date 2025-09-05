// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import auth from "./slices/authSlice";
import pets from "./slices/petSlice";
import reminders from "./slices/reminderSlice";
import records from "./slices/recordSlice";

export const store = configureStore({
  reducer: { auth, pets, reminders, records },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
