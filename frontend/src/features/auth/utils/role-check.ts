import type { UserRole } from "@/features/auth/types/auth.types";

export type RoleProtectedResource = {
  allowedRoles?: readonly UserRole[];
};

export function canAccessRole(
  role: UserRole | null,
  allowedRoles?: readonly UserRole[]
) {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (!role) {
    return false;
  }

  return allowedRoles.includes(role);
}

export function hasRole(
  role: UserRole | null,
  expectedRole: UserRole
) {
  return role === expectedRole;
}

export function hasAnyRole(
  role: UserRole | null,
  allowedRoles: readonly UserRole[]
) {
  return canAccessRole(role, allowedRoles);
}

export function filterByRole<
  Resource extends RoleProtectedResource,
>(resources: Resource[], role: UserRole | null) {
  return resources.filter((resource) =>
    canAccessRole(role, resource.allowedRoles)
  );
}
