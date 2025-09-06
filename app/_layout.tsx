import { Slot } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../store";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </Provider>
  );
}
