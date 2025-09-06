import { createContext, useContext, ReactNode, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { RootState } from "../store";
import { auth } from "../lib/firebase";
import { setUser, clearUser } from "../store/slices/authSlice";

type AuthContextType = {
  user: { uid: string; email: string | null } | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setUser({ uid: user.uid, email: user.email }));
      } else {
        dispatch(clearUser());
      }
    });
    return unsub;
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ user, isLoading: user === undefined }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
