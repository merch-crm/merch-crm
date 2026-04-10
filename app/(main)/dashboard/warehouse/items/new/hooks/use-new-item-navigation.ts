"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export function useNewItemNavigation(
  step: number,
  setStep: (s: number) => void,
  creationType: string,
  lineMode: string,
  setValidationError: (err: string) => void
) {
  const router = useRouter();

  const handleBack = useCallback(() => {
    setValidationError("");
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (step === 1) {
      setStep(0);
    } else if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      if (creationType === "single") {
        setStep(2);
      } else if (lineMode === "existing") {
        setStep(1);
      } else {
        setStep(2);
      }
    } else if (step === 4) {
      setStep(3);
    } else if (step > 4) {
      setStep(step - 1);
    } else {
      router.push(ROUTES.WAREHOUSE.CATEGORIES);
    }
  }, [step, setStep, creationType, lineMode, setValidationError, router]);

  const handleNext = useCallback((validate: (s: number) => boolean) => {
    if (!validate(step)) return;

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      if (creationType === "single") {
        setStep(2);
      } else if (lineMode === "existing") {
        setStep(3);
      } else {
        setStep(2);
      }
    } else if (step === 2 || step === 3) {
      setStep(step + 1);
    } else {
      setStep(step + 1);
    }
  }, [step, setStep, creationType, lineMode]);

  return { handleBack, handleNext };
}
