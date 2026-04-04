import { ReactNode } from "react";
import { UIKitSidebar } from "@/components/ui-kit";

export const metadata = {
  title: "UI Kit — MerchCRM",
};

export default function UIKitLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden">
      <UIKitSidebar />
      <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-10 h-full">
        {children}
      </main>
    </div>
  );
}
