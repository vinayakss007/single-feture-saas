/**
 * Compatibility surface for the non-landing pages.
 *
 * `app/app`, `app/dashboard`, `app/login`, `app/signup` and the password screens all
 * import `Nav`, `Footer` and `Section` from here. They now resolve to the
 * design-family aware implementations, which is what makes a product's chosen family
 * apply across the whole product rather than only its landing page.
 *
 * Kept as a re-export rather than moving the imports so that a family change never
 * requires touching seven page files, and so a product that has customised one of
 * those pages keeps working.
 */

export { Nav, Footer } from "./design/chrome";
export { Section, SectionHead, Shell, Eyebrow, H1, H2, Card, PrimaryLink, GhostLink, GroupBar, GroupStrip } from "./design/kit";
export { Landing } from "./design";
