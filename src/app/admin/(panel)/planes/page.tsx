import type { Metadata } from "next";
import PlanesAdmin from "@/components/admin/planes-admin";
import { getPlans } from "@/lib/db";

export const metadata: Metadata = {
  title: "Planes",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPlanesPage() {
  const plans = getPlans(true);
  return <PlanesAdmin plans={plans} />;
}
