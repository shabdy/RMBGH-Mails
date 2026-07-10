// src/components/org-chart/utils.js
export const resolveBorderColor = (data) => {
  if (data?.borderColor) return data.borderColor;

  const role = data?.role?.toLowerCase() || "";
  if (role.includes("director")) return "red";
  if (role.includes("chief") || role.includes("head")) return "blue";

  return "#e5e7eb";
};

export const groupStaffByLabel = (staff = []) =>
  staff.reduce((acc, curr) => {
    const key = curr.label || "Others";
    if (!acc[key]) acc[key] = [];
    acc[key].push(curr);
    return acc;
  }, {});
