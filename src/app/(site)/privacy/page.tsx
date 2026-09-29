import type { Metadata } from "next";
import { getSite } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Fortune Electrical Construction handles information submitted through this website.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "September 29, 2026";

export default async function PrivacyPage() {
  const site = await getSite();
  const company = site.legal_name || site.company_name;
  const contact = [site.phone, site.email].filter(Boolean).join(" · ");
  const address = [site.address_line1, [site.city, site.state, site.postal_code].filter(Boolean).join(", ")].filter(Boolean).join(", ");

  const sections: { h: string; p: React.ReactNode[] }[] = [
    {
      h: "What we collect",
      p: [
        "Information you choose to send us through this website: your name, company, email address, phone number and the details you enter in our contact, bid invitation, prequalification request and job application forms.",
        "Files you choose to upload, such as a resume or bid documents.",
        "Basic, anonymous usage statistics (pages visited, device type, approximate country) to understand how the site is used. We do not use advertising cookies or sell your information.",
      ],
    },
    {
      h: "How we use it",
      p: [
        "To respond to your inquiry, evaluate bid opportunities, send prequalification documents, and review job applications.",
        "To keep the website secure and working — including automated checks that filter out spam.",
      ],
    },
    {
      h: "Who can see it",
      p: [
        `Submissions and uploaded files are stored with our hosting and database providers and are accessible only to authorized ${site.company_name} staff. Resumes and bid documents are kept in private storage and are never publicly accessible.`,
        "We share information only when needed to respond to you, when required by law, or with service providers that operate this website on our behalf (hosting, database, email delivery and spam protection).",
      ],
    },
    {
      h: "How long we keep it",
      p: ["We keep submissions for as long as they are useful for the purpose you sent them, or as required for business and legal records, and then delete them."],
    },
    {
      h: "Your choices",
      p: [`You can ask us to update or delete information you submitted by contacting us${contact ? ` at ${contact}` : ""}.`],
    },
    {
      h: "Changes",
      p: ["We may update this policy from time to time. The date at the top shows when it last changed."],
    },
  ];

  return (
    <>
      <section className="blueprint bg-ink pb-14 pt-32 text-white sm:pb-20 sm:pt-44">
        <div className="shell">
          <p className="label mb-6 text-fog">Last updated {UPDATED}</p>
          <h1 className="font-display text-[clamp(3rem,9vw,8rem)]">Privacy Policy</h1>
        </div>
      </section>
      <section className="bg-paper py-16 sm:py-24">
        <div className="shell max-w-3xl">
          <p className="text-lg leading-relaxed text-mute">
            This policy explains how {company} (“we”, “us”) handles information submitted through this website.
          </p>
          <div className="mt-12 space-y-12">
            {sections.map((s) => (
              <div key={s.h}>
                <h2 className="label border-b border-ink pb-3 text-ink">{s.h}</h2>
                <div className="mt-5 space-y-4">
                  {s.p.map((t, i) => (
                    <p key={i} className="leading-relaxed text-ink/80">
                      {t}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {address && (
            <p className="mt-16 text-sm text-mute">
              {company} · {address}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
