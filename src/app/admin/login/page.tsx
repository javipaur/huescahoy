import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import LoginForm from "@/components/admin/login-form";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Acceso admin",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const hasError = params.error === "1";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 text-choco">
      <Link href="/" className="mb-8 inline-flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-cream">
          <MapPin className="h-5 w-5" />
        </span>
        <span className="font-display text-xl font-bold">
          Huesca<span className="text-brand">Hoy</span>
        </span>
      </Link>
      <div className="w-full max-w-sm rounded-3xl border border-sand bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-display text-2xl font-bold">Acceso al panel</h1>
        <p className="mt-1 text-sm text-choco-muted">
          Introduce la contraseña de administración.
        </p>
        <div className="mt-6">
          <LoginForm hasError={hasError} />
        </div>
      </div>
      <p className="mt-6 text-xs text-choco-muted/70">
        {site.name} · {site.tagline}
      </p>
    </div>
  );
}
