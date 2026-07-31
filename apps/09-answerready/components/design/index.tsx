/**
 * Landing page dispatcher.
 *
 * `app/page.tsx` renders `<Landing p={product} />` and nothing else, so choosing a
 * design family is a one-word change in the product config rather than a rewrite of
 * the page. The switch is exhaustive over `DesignFamily`; adding a family without
 * adding a case is a type error rather than a silent fallback to standard.
 */

import type { ProductConfig } from "@/lib/types";
import { designFor } from "@/lib/design";
import { StandardLanding } from "./standard";
import { EditorialLanding } from "./editorial";
import { TerminalLanding } from "./terminal";
import { BentoLanding } from "./bento";
import { SplitLanding } from "./split";
import { BrutalistLanding } from "./brutalist";
import { LedgerLanding } from "./ledger";
import { ClinicalLanding } from "./clinical";

export function Landing({ p }: { p: ProductConfig }) {
  const family = designFor(p).family;
  switch (family) {
    case "standard":
      return <StandardLanding p={p} />;
    case "editorial":
      return <EditorialLanding p={p} />;
    case "terminal":
      return <TerminalLanding p={p} />;
    case "bento":
      return <BentoLanding p={p} />;
    case "split":
      return <SplitLanding p={p} />;
    case "brutalist":
      return <BrutalistLanding p={p} />;
    case "ledger":
      return <LedgerLanding p={p} />;
    case "clinical":
      return <ClinicalLanding p={p} />;
    default: {
      // Exhaustiveness guard: if a family is added to the union without a case
      // above, this fails to compile rather than silently rendering the wrong page.
      const unreachable: never = family;
      return unreachable;
    }
  }
}

export { Nav, Footer } from "./chrome";
