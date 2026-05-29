import { useState } from "react";

import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PasswordInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type"
>;

export function PasswordInput({
  id,
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex gap-2">
      <Input
        id={id}
        type={isVisible ? "text" : "password"}
        {...props}
      />

      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-controls={id}
        aria-pressed={isVisible}
        onClick={() =>
          setIsVisible((currentValue) => !currentValue)
        }
      >
        {isVisible ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
        <span className="sr-only">
          {isVisible
            ? "Hide password"
            : "Show password"}
        </span>
      </Button>
    </div>
  );
}
