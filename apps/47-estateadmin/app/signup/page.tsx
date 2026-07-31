import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { Nav, Footer } from "@/components/site";
import { product } from "@/lib/product";
import { currentUser } from "@/lib/auth";
import { dbAvailable } from "@/lib/db";
import { PLANS, formatQuota } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Create your account",
  description: `Create a free ${product.name} account.`,
};
export const dynamic = "force-dynamic";

export default async function SignupPage() {
  if (await currentUser()) redirect("/dashboard");
  return (
    <>
      <Nav p={product} />
      <main className="accent-fade px-5 py-20">
        <AuthForm mode="signup" accountsEnabled={dbAvailable()} />
        <p className="mx-auto mt-6 max-w-md text-center text-sm text-muted">
          The free plan includes {formatQuota(PLANS.free.monthlyRuns)} runs a month. No card, and nothing is charged
          until you choose to upgrade.
        </p>
      </main>
      <Footer p={product} />
    </>
  );
}
