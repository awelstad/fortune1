import { LandingIndexPage, landingIndexMeta } from "@/lib/landing";

export const revalidate = 300;
export const generateMetadata = () => landingIndexMeta("area");

export default function Page() {
  return <LandingIndexPage kind="area" />;
}
