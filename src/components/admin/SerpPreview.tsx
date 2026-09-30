/** Approximate Google search result preview with length guidance. */
export function SerpPreview({ url, title, description }: { url: string; title: string; description: string }) {
  const t = title.length > 60 ? `${title.slice(0, 57)}…` : title;
  const d = description.length > 158 ? `${description.slice(0, 155)}…` : description;
  const u = url.replace(/^https?:\/\//, "").replace(/\/$/, "").split("/");
  return (
    <div className="rounded-md border border-zinc-200 bg-white p-4" aria-label="Google search preview">
      <p className="truncate text-xs text-zinc-600">
        {u[0]}
        {u.length > 1 && <span className="text-zinc-400"> › {u.slice(1).join(" › ")}</span>}
      </p>
      <p className="mt-1 text-lg leading-snug text-[#1a0dab]">{t || "(no title)"}</p>
      <p className="mt-1 text-sm leading-snug text-zinc-600">{d || "(no description — Google will pick text from the page)"}</p>
    </div>
  );
}

export function LengthHint({ n, min, max }: { n: number; min: number; max: number }) {
  const tone = n === 0 ? "text-zinc-400" : n < min || n > max ? "text-amber-600" : "text-emerald-700";
  const note = n === 0 ? "using default" : n < min ? "a bit short" : n > max ? "may be cut off" : "good length";
  return (
    <span className={`text-xs ${tone}`}>
      {n} chars · {note}
    </span>
  );
}
