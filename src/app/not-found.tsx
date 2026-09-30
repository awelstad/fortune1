import Link from "next/link";
import { PageTracker } from "@/components/site/PageTracker";

export default function NotFound() {
  return (
    <main className="blueprint grid min-h-dvh place-items-center bg-ink px-4 text-white">
      <PageTracker notFound />
      <div className="text-center">
        <p className="label text-fog">404</p>
        <h1 className="font-display mt-4 text-[clamp(3rem,10vw,8rem)]">Not on the plans.</h1>
        <Link
          href="/projects"
          className="label mt-10 inline-block bg-white px-6 py-4 text-ink hover:bg-signal hover:text-white"
        >
          View our projects
        </Link>
      </div>
    </main>
  );
}
