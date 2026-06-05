import { PASSWORD_REQUIREMENTS } from '../lib/passwordStrength';

type PasswordStrengthChecklistProps = {
  password: string;
  className?: string;
};

export function PasswordStrengthChecklist({ password, className = '' }: PasswordStrengthChecklistProps) {
  if (!password) {
    return null;
  }

  const missingRequirements = PASSWORD_REQUIREMENTS.filter((requirement) => !requirement.test(password));

  if (missingRequirements.length === 0) {
    return <p className={`text-sm font-medium text-green-700 ${className}`}>Password is strong.</p>;
  }

  return (
    <p className={`text-sm text-muted-foreground ${className}`}>
      Password must include: {missingRequirements.map((requirement) => requirement.label).join(', ')}.
    </p>
  );
}
