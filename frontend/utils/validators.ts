// validators.ts - input validators (to be implemented)

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isStrongPassword(password: string): boolean {
  return password.length >= 6 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
}

export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}
