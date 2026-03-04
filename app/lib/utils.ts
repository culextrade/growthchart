import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateDetailedAge(birthDate: Date, referenceDate: Date = new Date()) {
  const birth = new Date(birthDate)
  const ref = new Date(referenceDate)

  let years = ref.getFullYear() - birth.getFullYear()
  let months = ref.getMonth() - birth.getMonth()
  let days = ref.getDate() - birth.getDate()

  if (days < 0) {
    months--
    const prevMonth = new Date(ref.getFullYear(), ref.getMonth(), 0)
    days += prevMonth.getDate()
  }

  if (months < 0) {
    years--
    months += 12
  }

  const parts = []
  if (years > 0) parts.push(`${years} tahun`)
  if (months > 0) parts.push(`${months} bulan`)
  if (days > 0 || parts.length === 0) parts.push(`${days} hari`)

  return parts.join(", ")
}

export function formatMonthsToDetailedAge(totalMonths: number | string) {
  const numMonths = typeof totalMonths === 'string' ? parseFloat(totalMonths) : totalMonths;
  if (isNaN(numMonths) || numMonths < 0) return "-";

  const years = Math.floor(numMonths / 12);
  const remainingMonths = Math.floor(numMonths % 12);

  // Calculate remaining fractional month into days (assuming average 30.4375 days/month)
  const fractionalMonth = numMonths - Math.floor(numMonths);
  const days = Math.round(fractionalMonth * 30.4375);

  const parts = [];
  if (years > 0) parts.push(`${years} tahun`);
  if (remainingMonths > 0 || (years === 0 && days === 0)) parts.push(`${remainingMonths} bulan`);
  if (days > 0) parts.push(`${days} hari`);

  return parts.join(", ");
}
