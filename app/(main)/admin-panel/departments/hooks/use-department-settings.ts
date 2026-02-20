import { useState, useEffect, useCallback } from "react";
import { updateDepartment, getRolesByDepartment } from "../../actions/departments.actions";
import { getRoles, updateRoleDepartment } from "../../actions/roles.actions";

export interface Role {
    id: string;
    name: string;
    isSystem: boolean;
    departmentId: string | null;
    department?: {
        name: string;
    } | null;
}

export function useDepartmentSettings(
    department: { id: string; name: string; description: string | null; color: string | null } | null,
    isOpen: boolean,
    onClose: () => void,
    onSuccess: () => void
) {
    const [state, setState] = useState({
        activeTab: "general",
        loading: false,
        error: null as string | null,
        selectedColor: department?.color || "indigo",
        departmentRoles: [] as Role[],
        allRoles: [] as Role[],
        rolesLoading: false,
        actionLoading: null as string | null,
    });

    const updateState = useCallback((updates: Partial<typeof state>) => {
        setState((prev) => ({ ...prev, ...updates }));
    }, []);

    useEffect(() => {
        if (department?.color) {
            updateState({ selectedColor: department.color });
        }
    }, [department, updateState]);

    const fetchRoles = useCallback(async () => {
        if (!department) return;
        updateState({ rolesLoading: true });
        try {
            const [deptRolesRes, allRolesRes] = await Promise.all([
                getRolesByDepartment(department.id),
                getRoles()
            ]);

            updateState({
                departmentRoles: (deptRolesRes.data as Role[]) || [],
                allRoles: (allRolesRes.data as Role[]) || []
            });
        } catch (err) {
            console.error("Error fetching roles:", err);
            updateState({ error: "Ошибка при загрузке ролей" });
        } finally {
            updateState({ rolesLoading: false });
        }
    }, [department, updateState]);

    useEffect(() => {
        if (isOpen && department && state.activeTab === "roles") {
            fetchRoles();
        }
    }, [isOpen, department, state.activeTab, fetchRoles]);

    const handleAddRole = async (roleId: string) => {
        if (!department) return;
        updateState({ actionLoading: roleId });
        const res = await updateRoleDepartment(roleId, department.id);
        if (res?.error) {
            updateState({ error: res.error, actionLoading: null });
        } else {
            await fetchRoles();
            updateState({ actionLoading: null });
            onSuccess();
        }
    };

    const handleRemoveRole = async (roleId: string) => {
        updateState({ actionLoading: roleId });
        const res = await updateRoleDepartment(roleId, null);
        if (res?.error) {
            updateState({ error: res.error, actionLoading: null });
        } else {
            await fetchRoles();
            updateState({ actionLoading: null });
            onSuccess();
        }
    };

    const handleGeneralSubmit = async (formData: FormData) => {
        if (!department) return;
        updateState({ loading: true, error: null });

        const res = await updateDepartment(department.id, formData);

        if (res?.error) {
            updateState({ loading: false, error: res.error });
        } else {
            updateState({ loading: false });
            onSuccess();
            onClose();
        }
    };

    return {
        state,
        updateState,
        handleAddRole,
        handleRemoveRole,
        handleGeneralSubmit
    };
}
