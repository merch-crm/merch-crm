import { useState, useEffect, useCallback } from "react";
import { updateUser } from "../../actions/users.actions";
import { getRoles } from "../../actions/roles.actions";
import { getDepartments } from "../../actions/departments.actions";
import type { User } from "@/lib/types";

type UserEditInput = Pick<User, "id" | "name" | "email" | "roleId" | "departmentId">;

export function useEditUser(
    user: UserEditInput | null,
    isOpen: boolean,
    onClose: () => void,
    onSuccess: () => void
) {
    const [state, setState] = useState({
        loading: false,
        roles: [] as { id: string, name: string, departmentId: string | null }[],
        departments: [] as { id: string, name: string }[],
        error: null as string | null,
        showPassword: false,
        selectedRoleId: user?.roleId || "",
        selectedDeptId: user?.departmentId || ""
    });

    const updateState = useCallback((updates: Partial<typeof state>) => {
        setState((prev) => ({ ...prev, ...updates }));
    }, []);

    useEffect(() => {
        let isMounted = true;
        if (isOpen) {
            Promise.all([getRoles(), getDepartments()]).then(([rolesRes, deptsRes]) => {
                if (isMounted) {
                    updateState({
                        roles: (rolesRes.data as { id: string, name: string, departmentId: string | null }[]) || [],
                        departments: (deptsRes.data as { id: string, name: string }[]) || []
                    });
                }
            });
        }
        return () => { isMounted = false; };
    }, [isOpen, updateState]);

    useEffect(() => {
        if (user && isOpen) {
            updateState({
                selectedRoleId: user.roleId || "",
                selectedDeptId: user.departmentId || ""
            });
        }
    }, [user, isOpen, updateState]);

    const handleRoleChange = useCallback((roleId: string) => {
        updateState({ selectedRoleId: roleId });
        setState(prev => {
            const role = prev.roles.find(r => r.id === roleId);
            if (role && role.departmentId) {
                return { ...prev, selectedDeptId: role.departmentId };
            }
            return prev;
        });
    }, [updateState]);

    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;

        updateState({ loading: true, error: null });

        const formData = new FormData(e.currentTarget);
        const res = await updateUser(user.id, formData);

        if (res?.error) {
            updateState({ loading: false, error: res.error });
        } else {
            updateState({ loading: false });
            onSuccess();
        }
    }, [user, onSuccess, updateState]);

    return {
        state,
        updateState,
        handleRoleChange,
        handleSubmit
    };
}
