import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Merge Tailwind classes without conflicts, e.g. cn("p-4", condition && "p-8")
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
