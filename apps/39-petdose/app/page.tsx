import { product } from "@/lib/product";
import { ApiBlock, Faq, Features, FinalCta, Footer, Hero, How, Nav, Pricing, ProblemBlock } from "@/components/site";

export default function LandingPage() {
  return (
    <>
      <Nav p={product} />
      <main>
        <Hero p={product} />
        <ProblemBlock p={product} />
        <Features p={product} />
        <How p={product} />
        <ApiBlock p={product} />
        <Pricing p={product} />
        <Faq p={product} />
        <FinalCta p={product} />
      </main>
      <Footer p={product} />
    </>
  );
}
