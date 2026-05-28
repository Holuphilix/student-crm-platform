import { useState } from "react";
import type { FormEvent } from "react";

import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type NoteInputProps = {
  isSubmitting?: boolean;
  onSubmitNote: (body: string) => Promise<void>;
};

export function NoteInput({
  isSubmitting = false,
  onSubmitNote,
}: NoteInputProps) {
  const [body, setBody] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedBody = body.trim();

    if (!trimmedBody) {
      return;
    }

    await onSubmitNote(trimmedBody);
    setBody("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2"
    >
      <Textarea
        value={body}
        disabled={isSubmitting}
        placeholder="Add a deal note..."
        className="min-h-20 resize-none"
        onChange={(event) =>
          setBody(event.target.value)
        }
      />

      <Button
        type="submit"
        size="icon-lg"
        disabled={
          isSubmitting || body.trim().length === 0
        }
        aria-label="Add note"
      >
        <Send />
      </Button>
    </form>
  );
}
