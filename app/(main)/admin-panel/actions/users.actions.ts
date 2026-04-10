"use server";

import { db } from "@/lib/db";
import { users, accounts } from "@/lib/schema/users";
import { auth } from "@/lib/auth";
import { withAuth, ROLE_GROUPS } from "@/lib/action-helpers";
import { logAction } from "@/lib/audit";
import { comparePassword } from "@/lib/password";
import { eq, asc, sql, or, ilike, and, type InferSelectModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  CreateUserSchema,
  UpdateUserSchema
} from "../validation";
import { ActionResult, ok, okVoid, err, ERRORS } from "@/lib/types";

type User = InferSelectModel<typeof users>;

// User Actions
export async function getCurrentUserAction(): Promise<ActionResult<User & { role: { id: string; name: string; slug: string | null } | null, department: { id: string; name: string } | null }>> {
  return withAuth(async (session) => {
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, session.id),
      with: {
        role: true,
        department: true
      }
    });

    if (!currentUser) return ERRORS.NOT_FOUND("Пользователь");
    return ok(currentUser as User & { 
      role: { id: string; name: string; slug: string | null } | null, 
      department: { id: string; name: string } | null 
    });
  }, { errorPath: "getCurrentUserAction" });
}

export async function getUsers(page = 1, limit = 20, search = ""): Promise<ActionResult<{
  users: User[];
  total: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}>> {
  return withAuth(async () => {
    const offset = (page - 1) * limit;

    const whereClause = search
      ? or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`))
      : undefined;

    const totalResult = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereClause)
      .limit(1);
    const total = Number(totalResult[0]?.count || 0);

    const allUsers = await db.query.users.findMany({
      with: {
        role: true,
        department: true
      },
      where: (u, { or, ilike }) => {
        if (!search) return undefined;
        return or(
          ilike(u.name, `%${search}%`),
          ilike(u.email, `%${search}%`)
        );
      },
      orderBy: [asc(users.name)],
      limit,
      offset
    });

    return ok({
      users: allUsers as User[],
      total,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  }, { roles: ROLE_GROUPS.ADMINS, errorPath: "getUsers" });
}

export async function createUser(formData: FormData): Promise<ActionResult<User>> {
  return withAuth(async () => {
    const data = Object.fromEntries(formData);
    const validated = CreateUserSchema.safeParse(data);
    if (!validated.success) return ERRORS.VALIDATION(validated.error.issues[0].message);

    const { email, password, name, roleId, departmentId } = validated.data;

    const newUser = await auth.api.createUser({
      headers: await import("next/headers").then(h => h.headers()),
      body: {
        email,
        password,
        name,
        // @ts-expect-error - Custom fields in schema
        roleId: roleId || undefined,

        departmentId: departmentId || undefined,
      }
    });

    if (!newUser) return err("Не удалось создать пользователя через Admin API");

    await logAction("Создание пользователя", "user", newUser.user.id, { email: newUser.user.email });
    revalidatePath("/admin-panel/users");
    return ok(newUser.user as unknown as User);
  }, { roles: ROLE_GROUPS.ADMINS, errorPath: "createUser" });
}

export async function updateUser(userId: string, formData: FormData): Promise<ActionResult<User>> {
  return withAuth(async () => {
    const data = Object.fromEntries(formData);
    const validated = UpdateUserSchema.safeParse(data);
    if (!validated.success) return ERRORS.VALIDATION(validated.error.issues[0].message);

    const updateData: Partial<User> = { ...validated.data };
    if (updateData.departmentId === "") updateData.departmentId = null;

    const [updatedUser] = await db.update(users)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) return ERRORS.NOT_FOUND("Пользователь");

    await logAction("Обновление пользователя", "user", userId, updateData);
    revalidatePath("/admin-panel/users");
    return ok(updatedUser as User);
  }, { roles: ROLE_GROUPS.ADMINS, errorPath: "updateUser" });
}

export async function deleteUser(userId: string, password?: string): Promise<ActionResult<void>> {
  return withAuth(async (session) => {
    if (session.id === userId) return err("Нельзя удалить самого себя");

    const targetUser = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (targetUser?.isSystem || password) {
      if (!password) return err("Для этого действия требуется пароль");
      
      const adminAccount = await db.query.accounts.findFirst({
        where: and(
          eq(accounts.userId, session.id),
          eq(accounts.providerId, "credential")
        )
      });

      if (!adminAccount || !adminAccount.password) {
        return err("Пароль администратора не найден");
      }

      const isMatch = await comparePassword(password, adminAccount.password);
      if (!isMatch) return err("Неверный пароль администратора");
    }

    await db.delete(users).where(eq(users.id, userId));
    await logAction("Удаление пользователя", "user", userId);
    revalidatePath("/admin-panel/users");
    return okVoid();
  }, { roles: ROLE_GROUPS.ADMINS, errorPath: "deleteUser" });
}
