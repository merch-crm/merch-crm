"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { addClient } from "../../actions/core.actions";
import { useDuplicateCheck } from "../../hooks/use-duplicate-check";

import { NewClientFormData, StepLogicState } from "../new-client.types";

export function useNewClientForm() {
  const router = useRouter();
  const { toast } = useToast();

  const {
    duplicates,
    allDuplicates,
    checkDuplicates,
    clearDuplicates,
    dismissDuplicates,
    hasDuplicates,
  } = useDuplicateCheck();

  const [logicState, setLogicState] = useState<StepLogicState>({
    step: 0,
    loading: false,
    clientType: "b2c",
    validationError: "",
    ignoreDuplicates: false
  });

  const [formData, setFormData] = useState<NewClientFormData>({
    lastName: "",
    firstName: "",
    patronymic: "",
    company: "",
    phone: "",
    email: "",
    telegram: "",
    instagram: "",
    socialLink: "",
    managerId: "",
    city: "",
    address: "",
    comments: "",
    acquisitionSource: ""
  });

  const updateFormData = useCallback((updates: Partial<NewClientFormData>) => {
    setFormData(prev => {
      const next = { ...prev, ...updates };

      // Проверяем дубликаты при изменении ключевых полей
      const keyFields = ["phone", "email", "lastName", "firstName", "company"];
      const hasKeyFieldChanged = Object.keys(updates).some(key => keyFields.includes(key));

      if (hasKeyFieldChanged) {
        checkDuplicates({
          phone: next.phone,
          email: next.email,
          lastName: next.lastName,
          firstName: next.firstName,
          company: logicState.clientType === "b2b" ? next.company : undefined,
        });
      }

      return next;
    });

    if (logicState.validationError) {
      setLogicState(prev => ({ ...prev, validationError: "" }));
    }
  }, [logicState.validationError, logicState.clientType, checkDuplicates]);

  const handleReset = useCallback(() => {
    setLogicState({
      step: 0,
      loading: false,
      clientType: "b2c",
      validationError: "",
      ignoreDuplicates: false
    });
    setFormData({
      lastName: "",
      firstName: "",
      patronymic: "",
      company: "",
      phone: "",
      email: "",
      telegram: "",
      instagram: "",
      socialLink: "",
      managerId: "",
      city: "",
      address: "",
      comments: "",
      acquisitionSource: ""
    });
    clearDuplicates();
    toast("Форма сброшена", "info");
  }, [clearDuplicates, toast]);

  const validateStep = useCallback((s: number) => {
    if (s === 0) {
      if (logicState.clientType === "b2b" && !formData.company) {
        setLogicState(prev => ({ ...prev, validationError: "Введите название организации" }));
        return false;
      }
      if (!formData.lastName) {
        setLogicState(prev => ({ ...prev, validationError: "Введите фамилию" }));
        return false;
      }
      if (!formData.firstName) {
        setLogicState(prev => ({ ...prev, validationError: "Введите имя" }));
        return false;
      }
    }
    if (s === 1) {
      if (!formData.phone) {
        setLogicState(prev => ({ ...prev, validationError: "Введите номер телефона" }));
        return false;
      }
    }
    setLogicState(prev => ({ ...prev, validationError: "" }));
    return true;
  }, [logicState.clientType, formData]);

  const handleNext = useCallback(() => {
    if (validateStep(logicState.step)) {
      setLogicState(prev => ({ ...prev, step: prev.step + 1 }));
    }
  }, [logicState.step, validateStep]);

  const handleBack = useCallback(() => {
    if (logicState.step > 0) {
      setLogicState(prev => ({ ...prev, step: prev.step - 1 }));
    } else {
      router.back();
    }
  }, [logicState.step, router]);

  const submitForm = useCallback(async () => {
    setLogicState(prev => ({ ...prev, loading: true }));

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "patronymic" && logicState.clientType === "b2b") {
        return;
      }
      data.append(key, value);
    });
    data.append("clientType", logicState.clientType);
    data.append("ignoreDuplicates", "true");

    const res = await addClient(data);
    setLogicState(prev => ({ ...prev, loading: false }));

    if (!res.success) {
      toast(res.error || "Ошибка сохранения", "error");
      playSound("notification_error");
    } else {
      toast("Клиент успешно добавлен", "success");
      playSound("client_created");
      router.push("/dashboard/clients");
      router.refresh();
    }
  }, [formData, logicState.clientType, router, toast]);

  return {
    logicState,
    setLogicState,
    formData,
    updateFormData,
    handleReset,
    handleNext,
    handleBack,
    submitForm,
    validateStep,
    duplicates,
    allDuplicates,
    dismissDuplicates,
    hasDuplicates,
  };
}
