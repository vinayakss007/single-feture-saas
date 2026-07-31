import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { Nav, Footer } from "@/components/site";
import { product } from "@/lib/product";
import { dbAvailable } from "@/lib/db";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <>
      <Nav p={product} />
      <main className="accent-fade px-5 py-20">
        <AuthForm mode="forgot" accountsEnabled={dbAvailable()} />
      </main>
      <Footer p={product} />
    </>
  );
}
