import type { PasswordRule } from "@/features/auth/utils/password-validation";

type PasswordRequirementsProps = {
  rules: PasswordRule[];
};

export function PasswordRequirements({
  rules,
}: PasswordRequirementsProps) {
  return (
    <div className="grid gap-2 text-sm">
      <p className="font-medium text-muted-foreground">
        Password requirements
      </p>

      {rules.map((rule) => (
        <p
          key={rule.id}
          className={
            rule.isValid
              ? "text-muted-foreground"
              : "text-destructive"
          }
        >
          {rule.isValid ? "✓" : "•"} {rule.message}
        </p>
      ))}
    </div>
  );
}
