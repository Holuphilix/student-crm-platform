export type PasswordRule = {
  id: string;
  message: string;
  isValid: boolean;
};

export function getPasswordRules(
  password: string
): PasswordRule[] {
  return [
    {
      id: "length",
      message: "Minimum 8 characters",
      isValid: password.length >= 8,
    },
    {
      id: "uppercase",
      message: "At least one uppercase letter",
      isValid: /[A-Z]/.test(password),
    },
    {
      id: "lowercase",
      message: "At least one lowercase letter",
      isValid: /[a-z]/.test(password),
    },
    {
      id: "numeric",
      message: "At least one number",
      isValid: /\d/.test(password),
    },
    {
      id: "special",
      message: "At least one special character",
      isValid: /[^A-Za-z0-9]/.test(password),
    },
  ];
}

export function isPasswordValid(password: string) {
  return getPasswordRules(password).every(
    (rule) => rule.isValid
  );
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
