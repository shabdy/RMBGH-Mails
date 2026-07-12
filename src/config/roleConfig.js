/**
 * Unified role configuration used across all pages.
 * - label:       Human-readable role name shown in badges and dropdowns.
 * - class:       Tailwind classes for badge styling (background, text, border).
 * - avatarColor: Solid Tailwind background class for avatar fallback circles.
 */
export const ROLE_CONFIG = {
  superadmin: {
    label:       "Super Admin",
    class:       "bg-red-50 text-red-700 border-red-200",
    avatarColor: "bg-red-500",
  },
  admin: {
    label:       "Admin",
    class:       "bg-purple-50 text-purple-700 border-purple-200",
    avatarColor: "bg-purple-500",
  },
  user: {
    label:       "Staff",
    class:       "bg-blue-50 text-blue-700 border-blue-200",
    avatarColor: "bg-blue-500",
  },
};

/** Convenience helper — returns the config entry, falling back to the `user` entry. */
export function getRoleConfig(role) {
  return ROLE_CONFIG[role] ?? ROLE_CONFIG.user;
}
