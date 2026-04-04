"use client";

import React from "react";
import { Info, AlertCircle, CheckCircle2, AlertTriangle, X, Loader2 } from "lucide-react";

export function BentoAlerts() {
  return (
    <div className="grid w-full max-w-xl gap-3">
      {/* Default - General information */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-100 dark:bg-[#18181b] border border-border/50">
        <Info className="w-5 h-5 mt-0.5 shrink-0 text-muted-foreground" />
        <div className="flex flex-col gap-1 flex-1">
          <h4 className="text-[11px] font-black text-foreground uppercase tracking-tight">New features available</h4>
          <p className="text-[11px] font-bold text-muted-foreground leading-relaxed">
            Check out our latest updates including dark mode support and improved accessibility features.
          </p>

        </div>
      </div>

      {/* Accent - Important information with action */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-100 dark:bg-[#18181b] border border-border/50">
        <Info className="w-5 h-5 mt-0.5 shrink-0 text-blue-500" />
        <div className="flex flex-col gap-1 flex-1">
          <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-tight">Update available</h4>
          <p className="text-[11px] font-bold text-muted-foreground leading-relaxed">
            A new version of the application is available. Please refresh to get the latest features and bug fixes.
          </p>

        </div>
        <button type="button" className="hidden sm:block shrink-0 px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-black uppercase rounded-full transition-colors">
          Refresh
        </button>

      </div>

      {/* Danger - Error with detailed steps */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-100 dark:bg-[#18181b] border border-border/50">
        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />
        <div className="flex flex-col gap-1 flex-1">
          <h4 className="text-[11px] font-black text-red-500 uppercase tracking-tight">Unable to connect to server</h4>
          <div className="text-[11px] font-bold text-muted-foreground leading-relaxed">
            We're experiencing connection issues. Please try the following:
            <ul className="mt-2 list-inside list-disc space-y-1 text-[11px] pl-1 font-bold">
              <li>Check your internet connection</li>
              <li>Refresh the page</li>
              <li>Clear your browser cache</li>
            </ul>
          </div>

        </div>
        <button type="button" className="hidden sm:block shrink-0 px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-[11px] font-black uppercase rounded-full transition-colors">
          Retry
        </button>

      </div>

      {/* Without description */}
      <div className="flex items-start justify-between gap-3 p-4 rounded-2xl bg-gray-100 dark:bg-[#18181b] border border-border/50">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-green-500" />
          <h4 className="text-[11px] font-black text-green-500 uppercase tracking-tight">Profile updated successfully</h4>
        </div>
        <button type="button" aria-label="Close alert" className="p-1 rounded-full text-muted-foreground hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
          <X className="w-4 h-4" />
        </button>


      </div>

      {/* Custom indicator - Loading state */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-100 dark:bg-[#18181b] border border-border/50">
        <Loader2 className="w-5 h-5 mt-0.5 shrink-0 text-blue-500 animate-spin" />
        <div className="flex flex-col gap-1 flex-1">
          <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-tight">Processing your request</h4>
          <p className="text-[11px] font-bold text-muted-foreground leading-relaxed">
            Please wait while we sync your data. This may take a few moments.
          </p>

        </div>
      </div>

      {/* Without close button */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-100 dark:bg-[#18181b] border border-border/50">
        <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-amber-500" />
        <div className="flex flex-col gap-1 flex-1">
          <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-tight">Scheduled maintenance</h4>
          <p className="text-[11px] font-bold text-muted-foreground leading-relaxed">
            Our services will be unavailable on Sunday, March 15th from 2:00 AM to 6:00 AM UTC for scheduled maintenance.
          </p>

        </div>
      </div>
    </div>
  );
}
