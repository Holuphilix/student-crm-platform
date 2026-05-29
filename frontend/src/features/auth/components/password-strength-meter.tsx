import { cn } from "@/lib/utils";
import type { PasswordRule } from "@/features/auth/utils/password-validation";

type PasswordStrengthMeterProps = {
  rules: PasswordRule[];
};

function getStrength(rules: PasswordRule[]) {
  const validRuleCount = rules.filter(
    (rule) => rule.isValid
  ).length;

  if (validRuleCount >= 5) {
    return {
      label: "Strong",
      value: 3,
      className: "bg-emerald-600",
    };
  }

  if (validRuleCount >= 3) {
    return {
      label: "Medium",
      value: 2,
      className: "bg-amber-500",
    };
  }

  return {
    label: "Weak",
    value: validRuleCount > 0 ? 1 : 0,
    className: "bg-destructive",
  };
}

export function PasswordStrengthMeter({
  rules,
}: PasswordStrengthMeterProps) {
  const strength = getStrength(rules);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Password strength
        </span>
        <span className="font-medium">
          {strength.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((segment) => (
          <div
            key={segment}
            className={cn(
              "h-2 rounded-full bg-muted",
              segment <= strength.value &&
                strength.className
            )}
          />
        ))}
      </div>
    </div>
  );
}
