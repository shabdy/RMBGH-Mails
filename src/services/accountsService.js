import { toast } from "sonner";
import api from "./apiClient";

/* ============================
   GET USERS
============================ */

export const getUsers = async () => {
  try {
    const { data } = await api.get("/users?status=Pending");
    return data;
  } catch (error) {
    console.error(error);
    toast.error("Failed to load pending users");
    return [];
  }
};

export const getAllUsers = async () => {
  try {
    const { data } = await api.get("/users");
    return data;
  } catch (error) {
    console.error(error);
    toast.error("Failed to load users");
    return [];
  }
};

export const getPendingUserCount = async () => {
  try {
    const { data } = await api.get("/users?status=Pending");
    return data.length;
  } catch {
    return 0;
  }
};

/* ============================
   USER STATUS
============================ */

export const activateUser = async (id) => {
  try {
    const { data } = await api.patch(`/users/${id}`, {
      status: "Active",
    });

    toast.success("User activated successfully");
    return data;
  } catch (error) {
    console.error(error);
    toast.error("Failed to activate user");
    throw error;
  }
};

export const deactivateUser = async (id) => {
  try {
    const { data } = await api.patch(`/users/${id}`, {
      status: "Inactive",
    });

    toast.success("User deactivated");
    return data;
  } catch (error) {
    console.error(error);
    toast.error("Failed to deactivate user");
    throw error;
  }
};

export const rejectUser = async (id) => {
  try {
    await api.delete(`/users/${id}`);
    toast.success("User removed successfully");
    return true;
  } catch (error) {
    console.error(error);
    toast.error("Failed to remove user");
    throw error;
  }
};

/* ============================
   UPDATE USER
============================ */

export const updateUser = async (
  id,
  {
    role,
    department,
    departmentId,
    status,
  }
) => {
  try {
    const payload = {};

    if (role !== undefined) payload.role = role;
    if (department !== undefined) payload.department = department;
    if (departmentId !== undefined) payload.departmentId = departmentId;
    if (status !== undefined) payload.status = status;

    const { data } = await api.patch(`/users/${id}`, payload);

    toast.success("User updated successfully");

    return data;
  } catch (error) {
    console.error(error);
    toast.error("Failed to update user");
    throw error;
  }
};

/* ============================
   DELETE USER
============================ */

export const deleteUser = async (id) => {
  try {
    await api.delete(`/users/${id}`);

    toast.success("User deleted successfully");

    return true;
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete user");
    throw error;
  }
};