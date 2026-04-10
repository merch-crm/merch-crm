import React from "react";
import { applyTypography } from "@/lib/typography";

export interface TypoProps extends React.LabelHTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  as?: React.ElementType;
}

/**
 * A wrapper component that applies Russian typography rules (non-breaking spaces after short prepositions)
 * to its children strings. Prevents Hydration Mismatch errors caused by browser extensions or OS 
 * modifying spaces automatically.
 */
export const Typo = React.forwardRef<HTMLElement, TypoProps>(
  ({ children, as: Component = "span", ...props }, ref) => {
    // We only process strings. If children are complex, they should ideally wrap text individually,
    // or we'd need a recursive React.Children.map string parser. For CRM, string processing is usually enough.
    
    const processedChildren = React.Children.map(children, (child) => {
      if (typeof child === "string") {
        return applyTypography(child);
      }
      return child;
    });

    // Use React.createElement to avoid polymorphic JSX typing issues with ElementType
    return React.createElement(
      Component as "span", // Cast to a basic element for typing, createElement handles the actual value
      { ...props, ref },
      processedChildren
    );
  }
);

Typo.displayName = "Typo";
