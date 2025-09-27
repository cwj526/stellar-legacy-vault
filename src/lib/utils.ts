import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string, visibleChars = 4) {
  if (!address) return "";
  const clean = address.trim();
  if (clean.length <= visibleChars * 2) return clean;
  return `${clean.slice(0, 2 + visibleChars)}...${clean.slice(-visibleChars)}`;
}
