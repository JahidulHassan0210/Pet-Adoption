import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMediaUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return "/sample.png"
  return `http://localhost:8000/media/${imagePath}`
}
