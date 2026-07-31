import { product } from "@/lib/product";
import { Landing } from "@/components/design";
import { Footer, Nav } from "@/components/design/chrome";

export default function LandingPage() {
  return (
    <>
      <Nav p={product} />
      <Landing p={product} />
      <Footer p={product} />
    </>
  );
}
