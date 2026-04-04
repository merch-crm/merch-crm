export type Booleanish = boolean | "true" | "false";

export const dataAttr = (condition: boolean | undefined): Booleanish =>
  (condition ? "true" : undefined) as Booleanish;
