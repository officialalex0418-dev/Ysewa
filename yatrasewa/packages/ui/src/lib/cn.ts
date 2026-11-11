import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind classnames merger (drop-in for shadcn cn utility). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
