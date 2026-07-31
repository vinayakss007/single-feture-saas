import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { Nav, Footer } from "@/components/site";
import { product } from "@/lib/product";
import { currentUser } from "@/lib/auth";
import { dbAvailable } from "@/lib/db";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await currentUser()) redirect("/dashboard");
  return (
    <>
      <Nav p={product} />
      <main id="main-content" className="accent-fade px-5 py-20">
        <AuthForm mode="login" accountsEnabled={dbAvailable()} />
      </main>
      <Footer p={product} />
    </>
  );
}
