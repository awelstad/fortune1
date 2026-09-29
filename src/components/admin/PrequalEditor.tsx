"use client";

import { useActionState, useState } from "react";
import { savePrequal } from "@/app/admin/(panel)/content-actions";
import type { ActionResult } from "@/lib/admin/auth";
import { DEFAULT_PREQUAL_DOCS } from "@/lib/format";
import type { Prequal, Safety } from "@/lib/types";
import { Button, Card, Field, Input, Notice, Textarea } from "./ui";

export function PrequalEditor({
  prequal,
  safety,
  licenseNumbers,
}: {
  prequal: Prequal;
  safety: Safety;
  licenseNumbers: string | null;
}) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(savePrequal, { ok: true });
  const [insurance, setInsurance] = useState(
    prequal.insurance?.length
      ? prequal.insurance
      : [
          { label: "General liability", value: "" },
          { label: "Auto liability", value: "" },
          { label: "Umbrella / excess", value: "" },
          { label: "Workers' compensation", value: "" },
        ],
  );
  const [docs, setDocs] = useState<string[]>(prequal.documents?.length ? prequal.documents : DEFAULT_PREQUAL_DOCS);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="insurance" value={JSON.stringify(insurance)} />
      <input type="hidden" name="documents" value={JSON.stringify(docs)} />
      <Notice tone="info">
        Only enter real, current figures. Anything left blank is hidden on the website. The license number also appears in the site
        footer.
      </Notice>
      {!state.ok && <Notice tone="error">{state.message}</Notice>}
      {state.ok && state.message && <Notice tone="success">{state.message}</Notice>}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Company & bonding">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="License number(s)" htmlFor="license_numbers" hint="e.g. EC13001234" className="sm:col-span-2">
              <Input id="license_numbers" name="license_numbers" defaultValue={licenseNumbers ?? ""} />
            </Field>
            <Field label="Years in business" htmlFor="years_in_business" hint="Leave blank to use the homepage stat">
              <Input id="years_in_business" name="years_in_business" inputMode="numeric" defaultValue={prequal.years_in_business ?? ""} />
            </Field>
            <Field label="Surety company" htmlFor="surety">
              <Input id="surety" name="surety" defaultValue={prequal.surety ?? ""} />
            </Field>
            <Field label="Bonding — single project" htmlFor="bonding_single" hint="e.g. $15M">
              <Input id="bonding_single" name="bonding_single" defaultValue={prequal.bonding_single ?? ""} />
            </Field>
            <Field label="Bonding — aggregate" htmlFor="bonding_aggregate" hint="e.g. $40M">
              <Input id="bonding_aggregate" name="bonding_aggregate" defaultValue={prequal.bonding_aggregate ?? ""} />
            </Field>
            <Field label="Note (optional)" htmlFor="notes" className="sm:col-span-2">
              <Textarea id="notes" name="notes" rows={2} defaultValue={prequal.notes ?? ""} />
            </Field>
          </div>
        </Card>

        <Card title="Safety record" description="Up to three of these also appear on the homepage.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="EMR" htmlFor="emr" hint="e.g. 0.72">
              <Input id="emr" name="emr" defaultValue={safety.emr ?? ""} />
            </Field>
            <Field label="TRIR" htmlFor="trir" hint="e.g. 0.8">
              <Input id="trir" name="trir" defaultValue={safety.trir ?? ""} />
            </Field>
            <Field label="Without a lost-time incident" htmlFor="lost_time_free" hint="e.g. 1.2M hrs or 5 yrs">
              <Input id="lost_time_free" name="lost_time_free" defaultValue={safety.lost_time_free ?? ""} />
            </Field>
            <Field label="DART rate" htmlFor="dart">
              <Input id="dart" name="dart" defaultValue={safety.dart ?? ""} />
            </Field>
            <Field label="Safety program (short paragraph)" htmlFor="program" className="sm:col-span-2">
              <Textarea id="program" name="program" rows={3} defaultValue={safety.program ?? ""} />
            </Field>
          </div>
        </Card>

        <Card
          title="Insurance limits"
          actions={
            <Button variant="secondary" onClick={() => setInsurance([...insurance, { label: "", value: "" }])}>
              + Add
            </Button>
          }
        >
          <ul className="space-y-2">
            {insurance.map((ins, i) => (
              <li key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <Input
                  value={ins.label}
                  placeholder="Coverage"
                  aria-label="Coverage"
                  onChange={(e) => setInsurance(insurance.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                />
                <Input
                  value={ins.value}
                  placeholder="e.g. $1M / $2M"
                  aria-label="Limit"
                  onChange={(e) => setInsurance(insurance.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                />
                <Button variant="ghost" className="px-2 text-red-600" aria-label="Remove" onClick={() => setInsurance(insurance.filter((_, j) => j !== i))}>
                  ×
                </Button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-zinc-500">Rows without a limit are hidden.</p>
        </Card>

        <Card
          title="Documents GCs can request"
          actions={
            <Button variant="secondary" onClick={() => setDocs([...docs, ""])}>
              + Add
            </Button>
          }
        >
          <ul className="space-y-2">
            {docs.map((d, i) => (
              <li key={i} className="grid grid-cols-[1fr_auto] gap-2">
                <Input value={d} aria-label="Document" onChange={(e) => setDocs(docs.map((x, j) => (j === i ? e.target.value : x)))} />
                <Button variant="ghost" className="px-2 text-red-600" aria-label="Remove" onClick={() => setDocs(docs.filter((_, j) => j !== i))}>
                  ×
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save prequalification & safety"}
      </Button>
    </form>
  );
}
