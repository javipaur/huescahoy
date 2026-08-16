import type { Metadata } from "next";
import CategoryAdmin from "@/components/admin/category-admin";
import { getCategoriesAdmin } from "@/lib/db";

export const metadata: Metadata = {
  title: "Categorías",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesAdmin();
  return <CategoryAdmin categories={categories} />;
}
