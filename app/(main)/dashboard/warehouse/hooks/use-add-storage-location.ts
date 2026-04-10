"use client";

import { useState } from"react";
import { addStorageLocation } from"../storage-actions";

interface UseAddStorageLocationProps {
  controlledIsOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function useAddStorageLocation({ controlledIsOpen, onOpenChange }: UseAddStorageLocationProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [responsibleUserId, setResponsibleUserId] = useState("");
  const [type, setType] = useState<"warehouse" |"production" |"office">("warehouse");
  const [isDefault, setIsDefault] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const setIsOpen = (open: boolean) => {
    if (onOpenChange) onOpenChange(open);
    else setInternalIsOpen(open);
  };

  const clearFieldError = (field: string) => {
    setFieldErrors(prev => ({ ...prev, [field]:"" }));
  };

  async function handleSubmit(formData: FormData) {
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;

    const newErrors: Record<string, string> = {};
    if (!name || name.trim().length < 2) newErrors.name ="Введите название склада";
    if (!address || address.trim().length < 5) newErrors.address ="Введите полный адрес";

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setIsPending(true);
    setFieldErrors({});
    const res = await addStorageLocation(formData);
    if (!res?.success) {
      setError(res.error);
    } else {
      setIsOpen(false);
      setError("");
      setFieldErrors({});
      setResponsibleUserId("");
      setType("warehouse");
    }
    setIsPending(false);
  }

  return {
    isOpen,
    setIsOpen,
    error,
    fieldErrors,
    clearFieldError,
    responsibleUserId,
    setResponsibleUserId,
    type,
    setType,
    isDefault,
    setIsDefault,
    isPending,
    handleSubmit,
  };
}
