export const ADMIN_ROLES = ["Администратор", "Руководство"] as const;
export type AdminRole = typeof ADMIN_ROLES[number];

export const isAdmin = (role: string | null | undefined): role is AdminRole => {
  if (!role) return false;
  return ADMIN_ROLES.includes(role as AdminRole);
};

export type AppRole = 
  | "Администратор" 
  | "Руководство" 
  | "Менеджер" 
  | "Дизайнер" 
  | "Печатник" 
  | "Вышивальщик" 
  | "Кладовщик";

export const canManageOrders = (role: string | null | undefined): boolean => {
  if (!role) return false;
  return ["Администратор", "Руководство", "Менеджер"].includes(role);
};

