"use client";

import React, { createContext, useState, useCallback, useMemo } from "react";
import { pluralize } from "@/lib/pluralize";

export const CategoryContext = createContext<{
  registerComponent: (id: string) => void;
  unregisterComponent: (id: string) => void;
}>({ registerComponent: () => {}, unregisterComponent: () => {} });

export function CategoryPage({ title, description, children }: {
  title: string; description: React.ReactNode; children: React.ReactNode;
}) {
  const [registeredComponents, setRegisteredComponents] = useState<Set<string>>(new Set());

  const registerComponent = useCallback((id: string) => {
    setRegisteredComponents(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  }, []);

  const unregisterComponent = useCallback((id: string) => {
    setRegisteredComponents(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const contextValue = useMemo(() => ({ registerComponent, unregisterComponent }), [registerComponent, unregisterComponent]);

  const count = registeredComponents.size;
  const noun = pluralize(count, 'компонент', 'компонента', 'компонентов');

  return (
    <CategoryContext.Provider value={contextValue}>
      <div className="mx-auto max-w-6xl px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-heading text-gray-950 ">{title}</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">{description} · {count} {noun}</p>
        </div>
        <div className="flex flex-col gap-3">{children}</div>
      </div>
    </CategoryContext.Provider>
  );
}

