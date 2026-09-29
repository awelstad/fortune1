"use client";

import { useActionState } from "react";
import { saveSiteSettings } from "@/app/admin/(panel)/content-actions";
import type { ActionResult } from "@/lib/admin/auth";
import type { SiteSettings } from "@/lib/types";
import { Button, Card, Field, Input, Textarea } from "./ui";

export function SettingsForm({ site }: { site: SiteSettings }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(saveSiteSettings, { ok: true });
  const v = (k: keyof SiteSettings) => (site[k] ?? "") as string;
  const errors = !state.ok ? (state.errors ?? {}) : {};

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Company">
          <div className="grid gap-4">
            <Field label="Company name *" htmlFor="company_name" error={errors.company_name}>
              <Input id="company_name" name="company_name" defaultValue={v("company_name")} />
            </Field>
            <Field label="Legal name" htmlFor="legal_name">
              <Input id="legal_name" name="legal_name" defaultValue={v("legal_name")} />
            </Field>
            <Field label="Tagline" htmlFor="tagline">
              <Input id="tagline" name="tagline" defaultValue={v("tagline")} />
            </Field>
            <Field label="Service area" htmlFor="service_area" hint="Shown in the footer and hero.">
              <Input id="service_area" name="service_area" defaultValue={v("service_area")} />
            </Field>
            <Field label="License numbers" htmlFor="license_numbers" hint="e.g. EC13001234 — shown in the footer.">
              <Input id="license_numbers" name="license_numbers" defaultValue={v("license_numbers")} />
            </Field>
          </div>
        </Card>
        <Card title="Contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone" htmlFor="phone">
              <Input id="phone" name="phone" defaultValue={v("phone")} />
            </Field>
            <Field label="Email" htmlFor="email" error={errors.email}>
              <Input id="email" name="email" type="email" defaultValue={v("email")} />
            </Field>
            <Field label="Address line 1" htmlFor="address_line1" className="sm:col-span-2">
              <Input id="address_line1" name="address_line1" defaultValue={v("address_line1")} />
            </Field>
            <Field label="Address line 2" htmlFor="address_line2" className="sm:col-span-2">
              <Input id="address_line2" name="address_line2" defaultValue={v("address_line2")} />
            </Field>
            <Field label="City" htmlFor="city">
              <Input id="city" name="city" defaultValue={v("city")} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="State" htmlFor="state">
                <Input id="state" name="state" defaultValue={v("state")} />
              </Field>
              <Field label="ZIP" htmlFor="postal_code">
                <Input id="postal_code" name="postal_code" defaultValue={v("postal_code")} />
              </Field>
            </div>
          </div>
        </Card>
        <Card title="Search engine defaults">
          <div className="grid gap-4">
            <Field label="Default title" htmlFor="default_seo_title">
              <Input id="default_seo_title" name="default_seo_title" defaultValue={v("default_seo_title")} />
            </Field>
            <Field label="Default description" htmlFor="default_seo_description">
              <Textarea id="default_seo_description" name="default_seo_description" rows={3} defaultValue={v("default_seo_description")} />
            </Field>
          </div>
        </Card>
        <Card title="Social links">
          <div className="grid gap-4">
            {["linkedin", "facebook", "instagram", "youtube"].map((k) => (
              <Field key={k} label={k[0].toUpperCase() + k.slice(1)} htmlFor={`social_${k}`}>
                <Input id={`social_${k}`} name={`social_${k}`} type="url" placeholder="https://" defaultValue={site.social_links?.[k] ?? ""} />
              </Field>
            ))}
          </div>
        </Card>
      </div>
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </Button>
        <p className="text-sm" aria-live="polite">
          {state.ok && state.message && <span className="text-emerald-700">✓ {state.message}</span>}
          {!state.ok && <span className="text-red-600">{state.message}</span>}
        </p>
      </div>
    </form>
  );
}
