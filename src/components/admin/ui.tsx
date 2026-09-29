import type { ComponentProps, ReactNode } from "react";

export const inputCls =
  "block w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-xs placeholder:text-zinc-400 focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20 disabled:bg-zinc-50";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  description,
  children,
  actions,
  className = "",
}: {
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg border border-zinc-200 bg-white ${className}`}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4">
          <div>
            {title && <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className = "",
}: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-zinc-700">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-zinc-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function Select(props: ComponentProps<"select">) {
  return <select {...props} className={`${inputCls} pr-8 ${props.className ?? ""}`} />;
}

export function Checkbox({ label, hint, ...props }: ComponentProps<"input"> & { label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" {...props} className="mt-0.5 size-4 rounded border-zinc-300 text-signal focus:ring-signal" />
      <span>
        <span className="block text-sm font-medium text-zinc-800">{label}</span>
        {hint && <span className="block text-xs text-zinc-500">{hint}</span>}
      </span>
    </label>
  );
}

type Variant = "primary" | "secondary" | "danger" | "ghost";
const btn: Record<Variant, string> = {
  primary: "bg-zinc-900 text-white hover:bg-zinc-700",
  secondary: "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50",
  danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
  ghost: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
};

export function Button({ variant = "primary", className = "", ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${btn[variant]} ${className}`}
    />
  );
}

export function buttonCls(variant: Variant = "primary") {
  return `inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${btn[variant]}`;
}

const badge = {
  current: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  upcoming: "bg-amber-50 text-amber-800 ring-amber-600/20",
  completed: "bg-zinc-100 text-zinc-700 ring-zinc-500/20",
  draft: "bg-zinc-50 text-zinc-500 ring-zinc-400/30",
  live: "bg-blue-50 text-blue-700 ring-blue-600/20",
  warn: "bg-orange-50 text-orange-700 ring-orange-600/20",
} as const;

export function Badge({ tone, children }: { tone: keyof typeof badge; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${badge[tone]}`}>
      {children}
    </span>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "success" | "error" | "warn"; children: ReactNode }) {
  const t = {
    info: "border-blue-200 bg-blue-50 text-blue-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-700",
    warn: "border-amber-200 bg-amber-50 text-amber-800",
  }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-md border px-4 py-3 text-sm ${t}`}>
      {children}
    </div>
  );
}
