export const PASSWORD_RULES = {
  minLength: 6,
  requireUppercase: true,
  requireLowercase: true,
} as const

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_RULES.minLength) {
    return `Password must be at least ${PASSWORD_RULES.minLength} characters.`
  }
  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter."
  }
  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    return "Password must include at least one lowercase letter."
  }
  return null
}
