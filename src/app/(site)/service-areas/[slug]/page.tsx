import { LandingDetailPage, landingMeta, landingParams } from "@/lib/landing";

export const revalidate = 300;
export const generateStaticParams = () => landingParams("area");

export async function generateMetadata({ params }: PageProps<"/service-areas/[slug]">) {
  return landingMeta("area", (await params).slug);
}

export default async function Page({ params }: PageProps<"/service-areas/[slug]">) {
  return <LandingDetailPage kind="area" slug={(await params).slug} />;
}
