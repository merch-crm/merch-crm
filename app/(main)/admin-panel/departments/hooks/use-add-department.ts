import { useState, useEffect, useCallback } from "react";
import { createDepartment } from "../../actions/departments.actions";
import { getRoles } from "../../actions/roles.actions";

export interface Role {
    id: string;
    name: string;
    department?: {
        name: string;
    } | null;
}

export function useAddDepartment(onSuccess: () => void) {
    const [state, setState] = useState({
        isOpen: false,
        loading: false,
        fetchingRoles: false,
        error: null as string | null,
        selectedColor: "indigo",
        roles: [] as Role[],
        selectedRoleIds: [] as string[],
    });

    const updateState = useCallback((updates: Partial<typeof state>) => {
        setState((prev) => ({ ...prev, ...updates }));
    }, []);

    useEffect(() => {
        let isMounted = true;
        if (state.isOpen) {
            updateState({ fetchingRoles: true });
            getRoles().then(res => {
                if (isMounted) {
                    updateState({
                        roles: (res.data as Role[]) || [],
                        fetchingRoles: false
                    });
                }
            });
        }
        return () => { isMounted = false; };
    }, [state.isOpen, updateState]);

    const toggleRole = useCallback((roleId: string) => {
        setState((prev) => ({
            ...prev,
            selectedRoleIds: prev.selectedRoleIds.includes(roleId)
                ? prev.selectedRoleIds.filter(id => id !== roleId)
                : [...prev.selectedRoleIds, roleId]
        }));
    }, []);

    const handleSubmit = useCallback(async (formData: FormData) => {
        updateState({ loading: true, error: null });
        const res = await createDepartment(formData, state.selectedRoleIds);

        if (res?.error) {
            updateState({ loading: false, error: res.error });
        } else {
            updateState({
                loading: false,
                isOpen: false,
                selectedRoleIds: []
            });
            onSuccess();
        }
    }, [state.selectedRoleIds, onSuccess, updateState]);

    return {
        state,
        updateState,
        toggleRole,
        handleSubmit,
    };
}
