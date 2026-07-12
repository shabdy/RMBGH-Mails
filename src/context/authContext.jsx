import { createContext, useState } from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // authService.getCurrentUser() reads synchronously from localStorage, so
  // there is no loading gap — initialize state directly, no loading flag needed.
  const [user, setUser] = useState(() => authService.getCurrentUser() || null);

  const login = async (email, password) => {
    try {
      const res = await authService.login(email, password);
      if (res.success) setUser(res.user);
      return res;
    } catch {
      return { success: false, error: "Login failed" };
    }
  };

  const register = async (data) => {
    try {
      const res = await authService.register(data);
      return res;
    } catch {
      return { success: false, error: "Registration failed" };
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
