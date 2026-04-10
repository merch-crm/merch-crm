"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoOtpInputProps {
  length?: number;
  onComplete?: (code: string) => void;
  className?: string;
}

export function BentoOtpInput({ 
  length = 6, 
  onComplete, 
  className 
}: BentoOtpInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    if (newOtp.every((val) => val !== "")) {
      onComplete?.(newOtp.join(""));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="flex gap-3 justify-center items-center">
        {otp.map((digit, i) => (
          <React.Fragment key={i}>
            <motion.div
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="relative"
            >
              <input
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                value={digit}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className={cn(
                  "size-14 rounded-element bg-white border-2 text-xl font-black text-center outline-none transition-all duration-300",
                  digit 
                    ? "border-primary-base shadow-lg shadow-slate-100 ring-0" 
                    : "border-slate-100 focus:border-primary-base focus:bg-white hover:bg-slate-50 hover:border-slate-200"
                )}
                placeholder="•"
              />
              {digit && (
                <motion.div
                  layoutId="activeDigitIndicator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-[#F8FAFC] rounded-element -z-10"
                />
              )}
            </motion.div>
            {(i + 1) % 3 === 0 && i < length - 1 && (
              <div className="w-4 h-1 bg-slate-200 rounded-full mx-1" />
            )}
          </React.Fragment>
        ))}
      </div>
      <p className="text-[11px] font-black text-muted-foreground   leading-none">
        Wait up to 2 minutes for the code
      </p>
    </div>
  );
}
