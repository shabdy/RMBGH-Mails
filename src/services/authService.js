import { toast } from "sonner";
import api from "./apiClient";

export const authService = {
  login: async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        toast.success("Login successful!");
        return { success: true, user: data.user };
      }
      toast.error(data.error || "Login failed");
      return { success: false, error: data.error };
    } catch (err) {
      const msg = err.response?.data?.error || "Invalid email or password";
      toast.error(msg);
      return { success: false, error: msg };
    }
  },

  register: async (data) => {
    try {
      const { data: res } = await api.post("/auth/register", data);
      if (res.success) {
        toast.success("Registration submitted! Please wait for admin approval.");
        return { success: true, user: res.user };
      }
      toast.error(res.error || "Registration failed");
      return { success: false, error: res.error };
    } catch (err) {
      const msg = err.response?.data?.error || "Registration failed";
      toast.error(msg);
      return { success: false, error: msg };
    }
  },

  logout: async () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast.success("Logged out successfully!");
    return { success: true };
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => !!localStorage.getItem("user"),
};
