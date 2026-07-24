// ─── Role Constants ─────────────────────────────────────────────────────────

export const ROLES = {
  ADMIN: "admin",
  MANAJER_TOKO: "manajer_toko",
  SUPERVISOR: "supervisor",
  KASIR: "kasir",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// ─── Permission Constants ───────────────────────────────────────────────────

export const PERMISSIONS = {
  MANAGE_USERS: "manage_users",
  VIEW_USERS: "view_users",
  MANAGE_PRODUCTS: "manage_products",
  VIEW_PRODUCTS: "view_products",
  MANAGE_SALES: "manage_sales",
  VIEW_REPORTS: "view_reports",
  CREATE_SALES: "create_sales",
  VIEW_SALES: "view_sales",
  VOID_SALES: "void_sales",
  MANAGE_INVENTORY: "manage_inventory",
  VIEW_INVENTORY: "view_inventory",
  MANAGE_SUPPLIERS: "manage_suppliers",
  VIEW_SUPPLIERS: "view_suppliers",
  MANAGE_MEMBERS: "manage_members",
  VIEW_MEMBERS: "view_members",
  VIEW_AUDIT_LOGS: "view_audit_logs",
  OPERATE_CASH_DRAWER: "operate_cash_drawer",
  MANAGE_CASH_DRAWER: "manage_cash_drawer",
  VIEW_CASH_DRAWER: "view_cash_drawer",
  VIEW_PURCHASE: "view_purchase",
  MANAGE_PURCHASE: "manage_purchase",
  MANAGE_CASH_ACCOUNTS: "manage_cash_accounts",
  MANAGE_EXPENSES: "manage_expenses",
  VIEW_EXPENSES: "view_expenses",
  MANAGE_CHART_OF_ACCOUNTS: "manage_chart_of_accounts",
  VIEW_CHART_OF_ACCOUNTS: "view_chart_of_accounts",
  MANAGE_SETTINGS: "manage_settings",
  MANAGE_STORES: "manage_stores",
  VIEW_STORES: "view_stores",
  MANAGE_MANUAL_JOURNALS: "manage_manual_journals",
  VIEW_MANUAL_JOURNALS: "view_manual_journals",
  MANAGE_STOCK_TRANSFERS: "manage_stock_transfers",
  VIEW_STOCK_TRANSFERS: "view_stock_transfers",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ─── Role Hierarchy ─────────────────────────────────────────────────────────

/** Roles that can access the admin dashboard */
export const ADMIN_ROLES: Role[] = [
  ROLES.ADMIN,
  ROLES.MANAJER_TOKO,
  ROLES.SUPERVISOR,
];

/** All roles including cashier */
export const ALL_ROLES: Role[] = [
  ROLES.ADMIN,
  ROLES.MANAJER_TOKO,
  ROLES.SUPERVISOR,
  ROLES.KASIR,
];

// ─── Helpers ────────────────────────────────────────────────────────────────

export function hasRole(userRoles: string[], role: string): boolean {
  if (userRoles.includes(ROLES.ADMIN)) return true;
  return userRoles.includes(role);
}

export function hasPermission(
  userRoles: string[],
  userPermissions: string[],
  permission: string
): boolean {
  if (userRoles.includes(ROLES.ADMIN)) return true;
  return userPermissions.includes(permission);
}

export function canAccessAdmin(userRoles: string[]): boolean {
  return ADMIN_ROLES.some((role) => userRoles.includes(role));
}
