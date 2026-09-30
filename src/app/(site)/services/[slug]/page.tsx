import { LandingDetailPage, landingMeta, landingParams } from "@/lib/landing";

export const revalidate = 300;
export const generateStaticParams = () => landingParams("service");

export async function generateMetadata({ params }: PageProps<"/services/[slug]">) {
  return landingMeta("service", (await params).slug);
}

export default async function Page({ params }: PageProps<"/services/[slug]">) {
  return <LandingDetailPage kind="service" slug={(await params).slug} />;
}
