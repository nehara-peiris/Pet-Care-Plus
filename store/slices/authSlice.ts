// store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
type AuthUser = { uid: string; email: string | null; displayName?: string | null; };
type State = { user: AuthUser | null };
const initialState: State = { user: null };

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (s, a: PayloadAction<AuthUser>) => { s.user = a.payload; },
    clearUser: (s) => { s.user = null; },
  },
});
export const { setUser, clearUser } = slice.actions;
export default slice.reducer;
