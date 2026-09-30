import { LandingDetailPage, landingMeta, landingParams } from "@/lib/landing";

export const revalidate = 300;
export const generateStaticParams = () => landingParams("market");

export async function generateMetadata({ params }: PageProps<"/markets/[slug]">) {
  return landingMeta("market", (await params).slug);
}

export default async function Page({ params }: PageProps<"/markets/[slug]">) {
  return <LandingDetailPage kind="market" slug={(await params).slug} />;
}
