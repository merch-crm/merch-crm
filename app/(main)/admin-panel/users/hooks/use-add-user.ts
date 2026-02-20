import { useState, useEffect, useCallback } from "react";
import { createUser } from "../../actions/users.actions";
import { getRoles } from "../../actions/roles.actions";
import { getDepartments } from "../../actions/departments.actions";
import { useRouter } from "next/navigation";

export function useAddUser(onSuccess?: () => void) {
    const router = useRouter();
    const [state, setState] = useState({
        isOpen: false,
        loading: false,
        roles: [] as { id: string, name: string, departmentId: string | null }[],
        departments: [] as { id: string, name: string }[],
        error: null as string | null,
        selectedRoleId: "",
        selectedDeptId: ""
    });

    const updateState = useCallback((updates: Partial<typeof state>) => {
        setState((prev) => ({ ...prev, ...updates }));
    }, []);

    useEffect(() => {
        let isMounted = true;
        if (state.isOpen) {
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
    }, [state.isOpen, updateState]);

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
        updateState({ loading: true, error: null });

        const formData = new FormData(e.currentTarget);
        const res = await createUser(formData);

        if (res?.error) {
            updateState({ loading: false, error: res.error });
        } else {
            updateState({ loading: false, isOpen: false });
            if (onSuccess) {
                onSuccess();
            } else {
                router.refresh();
            }
        }
    }, [onSuccess, router, updateState]);

    return {
        state,
        updateState,
        handleRoleChange,
        handleSubmit
    };
}
