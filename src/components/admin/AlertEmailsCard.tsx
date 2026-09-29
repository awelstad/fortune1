"use client";

import { useState, useTransition } from "react";
import { saveNotificationEmails } from "@/app/admin/(panel)/content-actions";
import { Button, Card, Field, Input, Notice } from "./ui";

export function AlertEmailsCard({ initial, configured }: { initial: string; configured: boolean }) {
  const [value, setValue] = useState(initial);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();

  return (
    <Card title="Email alerts" description="Who gets an email for each new bid invite, prequal request, application and inquiry.">
      <div className="space-y-3">
        {!configured && (
          <Notice tone="warn">Email sending isn&apos;t switched on yet (needs a Resend API key on the server). Submissions are still saved here.</Notice>
        )}
        {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
        <Field label="Send alerts to" htmlFor="alert-emails" hint="Separate multiple addresses with commas.">
          <Input id="alert-emails" value={value} onChange={(e) => setValue(e.target.value)} />
        </Field>
        <Button
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await saveNotificationEmails(value);
              setMsg({ tone: res.ok ? "success" : "error", text: res.message ?? "Saved." });
            })
          }
        >
          {pending ? "Saving…" : "Save recipients"}
        </Button>
      </div>
    </Card>
  );
}
