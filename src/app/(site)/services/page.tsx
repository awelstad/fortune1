import { LandingIndexPage, landingIndexMeta } from "@/lib/landing";

export const revalidate = 300;
export const generateMetadata = () => landingIndexMeta("service");

export default function Page() {
  return <LandingIndexPage kind="service" />;
}
