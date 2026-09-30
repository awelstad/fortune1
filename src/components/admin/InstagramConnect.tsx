"use client";

import { useState, useTransition } from "react";
import { connectInstagram, disconnectInstagram } from "@/app/admin/(panel)/social/actions";
import { Badge, Button, Card, Field, Input, Notice } from "./ui";

export function InstagramConnect({
  connected,
  username,
  renewedAt,
}: {
  connected: boolean;
  username: string | null;
  renewedAt: string | null;
}) {
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();
  const act = (fn: () => Promise<{ ok: boolean; message?: string }>) =>
    start(async () => {
      const res = await fn();
      setMsg({ tone: res.ok ? "success" : "error", text: res.message ?? "Done." });
      if (res.ok) setToken("");
    });

  return (
    <Card
      title="Instagram connection"
      description="Needed only when the photo bar uses Instagram posts."
      actions={connected ? <Badge tone="live">Connected{username ? ` · @${username}` : ""}</Badge> : <Badge tone="draft">Not connected</Badge>}
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
          {connected && (
            <p className="text-sm text-zinc-600">
              Posts refresh about once an hour. The access key renews itself automatically
              {renewedAt ? ` (last renewed ${new Date(renewedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })})` : ""}.
            </p>
          )}
          <Field
            label={connected ? "Replace access token" : "Instagram access token"}
            htmlFor="ig_token"
            hint="Stored privately — never shown on the website or sent to visitors."
          >
            <Input
              id="ig_token"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="IGAA…"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button disabled={pending || !token.trim()} onClick={() => act(() => connectInstagram(token))}>
              {pending ? "Checking…" : connected ? "Replace" : "Connect"}
            </Button>
            {connected && (
              <Button variant="danger" disabled={pending} onClick={() => act(disconnectInstagram)}>
                Disconnect
              </Button>
            )}
          </div>
        </div>

        <details className="rounded-md border border-zinc-200 p-4 text-sm text-zinc-700 open:bg-zinc-50">
          <summary className="cursor-pointer font-medium text-zinc-900">How to get a token (one-time, ~10 minutes)</summary>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>
              In the Instagram app, make sure the account is a <strong>Business</strong> or <strong>Creator</strong> account (Settings →
              Account type and tools).
            </li>
            <li>
              Go to{" "}
              <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" className="text-signal hover:underline">
                developers.facebook.com/apps
              </a>
              , sign in, and create an app (type: <em>Business</em>).
            </li>
            <li>
              Add the <strong>Instagram</strong> product and choose <em>API setup with Instagram login</em>.
            </li>
            <li>
              Under <em>Generate access tokens</em>, add your Instagram account, then click <strong>Generate token</strong> and log in.
            </li>
            <li>Copy the token and paste it here. Only the account&apos;s own posts are read; nothing is ever posted.</li>
          </ol>
        </details>
      </div>
    </Card>
  );
}
