import { useState } from "react";
import type { FormEvent } from "react";

import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type MessageInputProps = {
  disabled?: boolean;
  isSending?: boolean;
  onSendMessage: (message: string) => Promise<void>;
};

export function MessageInput({
  disabled = false,
  isSending = false,
  onSendMessage,
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    await onSendMessage(trimmedMessage);
    setMessage("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 border-t p-4"
    >
      <Textarea
        value={message}
        disabled={disabled || isSending}
        placeholder="Write a message..."
        className="max-h-36 min-h-10 resize-none"
        onChange={(event) =>
          setMessage(event.target.value)
        }
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            !event.shiftKey
          ) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
      />

      <Button
        type="submit"
        size="icon-lg"
        disabled={
          disabled || isSending || message.trim().length === 0
        }
        aria-label="Send message"
      >
        <Send />
      </Button>
    </form>
  );
}
