export const PASSWORD_REQUIREMENTS = [
  { id: 'length', label: 'at least 8 characters', test: (value: string) => value.length >= 8 },
  { id: 'lowercase', label: 'one lowercase letter', test: (value: string) => /[a-z]/.test(value) },
  { id: 'uppercase', label: 'one uppercase letter', test: (value: string) => /[A-Z]/.test(value) },
  { id: 'number', label: 'one number', test: (value: string) => /\d/.test(value) },
  { id: 'special', label: 'one special character', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
  { id: 'spaces', label: 'no spaces', test: (value: string) => !/\s/.test(value) },
];

export function getPasswordStrengthIssues(password: string) {
  return PASSWORD_REQUIREMENTS.filter((requirement) => !requirement.test(password)).map((requirement) => requirement.label);
}

export function getPasswordStrengthError(password: string, label = 'Password') {
  const issues = getPasswordStrengthIssues(password);
  if (issues.length === 0) return '';

  return `${label} must include: ${issues.join(', ')}.`;
}
