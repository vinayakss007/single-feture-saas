import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Nav, Footer } from "@/components/site";
import { product } from "@/lib/product";
import { dbAvailable } from "@/lib/db";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** In Next 15 searchParams is a Promise in server components. */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <>
      <Nav p={product} />
      <main id="main-content" className="accent-fade px-5 py-20">
        {token ? (
          <AuthForm mode="reset" token={token} accountsEnabled={dbAvailable()} />
        ) : (
          <div className="mx-auto w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold tracking-tight">This link is incomplete</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              The reset link needs a token, and this URL has none — usually because the link wrapped across two lines in
              an email client. Request a fresh one and open it in a single click.
            </p>
            <Link
              href="/forgot-password"
              className="mt-6 inline-block rounded-xl px-4 py-2.5 text-sm font-semibold"
              style={{ background: "var(--accent)", color: "var(--on-accent)" }}
            >
              Request a new link
            </Link>
          </div>
        )}
      </main>
      <Footer p={product} />
    </>
  );
}
