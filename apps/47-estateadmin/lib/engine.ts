import type { RunInput, RunResult, Severity } from "./types.ts";

/**
 * EstateAdmin engine - Generates chronological checklist for estate
 * administration after death in India, considering religion, assets, and heirs.
 */

type TaskItem = {
  task: string;
  details: string;
  documents: string[];
  timeline: string;
  phase: "immediate" | "short" | "medium" | "long";
  where: string;
};

const SUCCESSION_LAW: Record<string, { act: string; description: string; shares: string; process: string }> = {
  Hindu: {
    act: "Hindu Succession Act, 1956 (amended 2005)",
    description: "Class I heirs (spouse, sons, daughters, mother of deceased) inherit equally. Daughters have equal coparcenary rights since 2005 amendment. If no Class I heir, Class II heirs (father, siblings, etc.) inherit.",
    shares: "Equal shares among all Class I heirs. Spouse gets one share. Each child (son or daughter) gets one share. Mother gets one share. Example: spouse + 2 children + mother = 4 heirs, 25% each.",
    process: "Intestate: Legal Heir Certificate from tehsildar OR Succession Certificate from District Court. Testate (will): Probate from High Court (mandatory in Mumbai, Kolkata, Chennai) or District Court.",
  },
  Muslim: {
    act: "Muslim Personal Law (Shariat) Application Act, 1937",
    description: "Sharia-based distribution: fixed-share heirs (Quranic heirs) get specified fractions first, remainder to residuaries (agnatic heirs). Will (Wasiyat) limited to 1/3 of estate.",
    shares: "Wife gets 1/8 (if children) or 1/4 (no children). Husband gets 1/4 (if children) or 1/2 (no children). Daughter gets 1/2 (one daughter) or 2/3 (multiple daughters shared). Son gets double the daughter's share as residuary.",
    process: "Succession Certificate from District Court. No probate required for Muslim wills. Will limited to 1/3 of estate without heir consent.",
  },
  Christian: {
    act: "Indian Succession Act, 1925 (Part V)",
    description: "Spouse gets 1/3, children share remaining 2/3 equally. If no children, spouse gets 1/2 and parents/siblings share the rest. Applies uniformly regardless of denomination.",
    shares: "With children: spouse 1/3, children share 2/3 equally. Without children: spouse 1/2, rest to kindred (parents, siblings). If no spouse: all to children equally.",
    process: "Probate mandatory for wills in Mumbai, Kolkata, Chennai. Letter of Administration from District Court for intestate estates. Succession Certificate for movable property.",
  },
  Parsi: {
    act: "Indian Succession Act, 1925 (Part V, special provisions for Parsis)",
    description: "Specific Parsi intestacy rules under Sections 50-56 of Indian Succession Act. Spouse and children inherit, with specific fractions. No distinction between movable and immovable.",
    shares: "Spouse and children share equally. If only spouse and one child: 1/2 each. Spouse, 2+ children: equal shares. If lineal descendants exist, parents get nothing (different from other communities).",
    process: "Probate mandatory for wills. Letter of Administration for intestate. Filed in District Court or High Court depending on estate value.",
  },
};

function buildChecklist(state: string, religion: string, assets: string[], hasWill: string, numHeirs: number, hasNri: boolean): TaskItem[] {
  const tasks: TaskItem[] = [];
  const willStatus = hasWill.includes("registered") ? "registered" : hasWill.includes("unregistered") ? "unregistered" : "none";

  // IMMEDIATE (0-7 days)
  tasks.push({
    task: "Obtain Death Certificate from Municipal Corporation",
    details: "Register death within 21 days (mandatory under Registration of Births & Deaths Act). Hospital provides cause-of-death certificate. Municipal office issues official death certificate. Get 10-15 certified copies.",
    documents: ["Hospital death summary / cause of death certificate", "Deceased's Aadhaar card", "Informant's ID proof", "Proof of address of deceased"],
    timeline: "Apply within 21 days of death. Certificate issued in 3-7 days.",
    phase: "immediate",
    where: "Municipal Corporation / Gram Panchayat office of the area where death occurred",
  });

  tasks.push({
    task: "Inform bank(s) immediately to prevent unauthorized transactions",
    details: "Visit the branch with death certificate to freeze accounts (if sole account) or inform of death (joint accounts). Prevents misuse and starts the claim process. Joint accounts with 'Either or Survivor' continue normally.",
    documents: ["Death certificate (original for verification, submit copy)", "Informant's ID and relationship proof"],
    timeline: "Within 24-48 hours of obtaining death certificate",
    phase: "immediate",
    where: "Bank branch where accounts are held",
  });

  tasks.push({
    task: "Secure all original documents of the deceased",
    details: "Locate and secure: property documents (sale deeds, title), bank passbooks, FD receipts, insurance policies, will (if any), PAN card, Aadhaar, share certificates, PF passbook, pension documents, vehicle RC, gold receipts.",
    documents: ["Make inventory of all documents found"],
    timeline: "Within first week",
    phase: "immediate",
    where: "Deceased's residence, bank locker (if any - will need separate process to open)",
  });

  if (assets.some((a) => a.includes("insurance"))) {
    tasks.push({
      task: "Intimate insurance company and initiate claim",
      details: "Life insurance claim must be filed. Most policies have nominee. If nominee exists, claim is straightforward. If no nominee, succession certificate needed. Note: claims should be filed within 3 years (limitation).",
      documents: ["Death certificate", "Original policy document", "Claimant's ID and bank details", "NEFT mandate form", "Nominee/legal heir proof"],
      timeline: "Intimate within 7 days. Claim processing: 30-60 days with nominee, 6-12 months without.",
      phase: "immediate",
      where: "Insurance company branch or online portal",
    });
  }

  // SHORT-TERM (7-30 days)
  if (willStatus !== "none") {
    const probateRequired = ["Maharashtra", "West Bengal", "Tamil Nadu"].includes(state);
    tasks.push({
      task: `${probateRequired ? "File for Probate (mandatory in " + state + ")" : "Consider filing for Probate"} of the Will`,
      details: `${willStatus === "registered" ? "Registered will with Sub-Registrar" : "Unregistered will (valid but may face challenges)"}. Probate is a court order confirming the will's validity. ${probateRequired ? "MANDATORY in " + state + " for immovable property." : "Recommended but not mandatory in " + state + ". Banks/registrars may insist on it."}`,
      documents: ["Original will", "Death certificate", "Petition for probate", "List of assets", "List of beneficiaries", "Affidavit of witnesses to will"],
      timeline: "File within 3-6 months. Court process: 6-12 months (no contest) to 2-3 years (contested).",
      phase: "short",
      where: `${probateRequired ? "High Court" : "District Court"} having jurisdiction`,
    });
  } else {
    tasks.push({
      task: "Apply for Legal Heir Certificate AND/OR Succession Certificate",
      details: `No will exists (intestate succession under ${SUCCESSION_LAW[religion].act}). Two options: (1) Legal Heir Certificate from Tehsildar (for simple claims, pension, PF). (2) Succession Certificate from District Court (for bank accounts, shares, substantial movable property). Property needs mutation separately.`,
      documents: ["Death certificate", "All heirs' ID proof and Aadhaar", "Relationship proof (ration card, birth certificates)", "Affidavit from all heirs", "No objection from all heirs"],
      timeline: "Legal Heir Certificate: 15-30 days. Succession Certificate: 6-12 months (court process with newspaper notice).",
      phase: "short",
      where: "Tehsildar office (Legal Heir Certificate) / District Court (Succession Certificate)",
    });
  }

  tasks.push({
    task: "File final income tax return for the deceased",
    details: "ITR for the year of death (April 1 to date of death) must be filed by the legal representative. Any refund goes to legal heirs. Also close PAN after all proceedings complete.",
    documents: ["PAN of deceased", "Form 26AS / AIS", "Bank statements", "Legal heir certificate", "Death certificate"],
    timeline: "By July 31 of the assessment year (if death in current FY) or extended deadline",
    phase: "short",
    where: "Income Tax e-filing portal (incometax.gov.in)",
  });

  if (assets.some((a) => a.includes("PF") || a.includes("pension"))) {
    tasks.push({
      task: "Claim Provident Fund and Pension",
      details: "File PF withdrawal claim (Form 20 for PF, Form 10D for pension) with employer's HR or directly with EPFO. If nominee is registered, straightforward. Otherwise need succession certificate/legal heir certificate.",
      documents: ["Death certificate", "PF account number / UAN", "Nominee's/legal heir's bank details", "Form 20 (PF)", "Form 10D (pension)", "Legal heir certificate (if no nominee)"],
      timeline: "Claim within 3 months for smooth processing. EPFO settles in 20-30 days after complete documents.",
      phase: "short",
      where: "Employer HR department / EPFO regional office / UMANG app",
    });
  }

  // MEDIUM-TERM (1-6 months)
  if (assets.some((a) => a.includes("property"))) {
    tasks.push({
      task: "Apply for Property Mutation (transfer of land records)",
      details: "Mutation transfers property revenue records to legal heirs' names. Does NOT transfer ownership (that needs registered deed/court order), but is essential for tax payment and eventual sale. Process varies by state.",
      documents: ["Death certificate", "Succession certificate / Probate / Legal heir certificate", "Property documents (7/12 extract, title deed)", "All heirs' consent (no objection affidavit)", "Application form (state-specific)"],
      timeline: "1-6 months depending on state and whether contested",
      phase: "medium",
      where: `Tehsildar / Sub-Registrar office / ${state} land records portal`,
    });
  }

  if (assets.some((a) => a.includes("shares") || a.includes("mutual"))) {
    tasks.push({
      task: "Transmit shares and mutual fund units",
      details: "Shares held in demat: contact broker and depository (NSDL/CDSL) for transmission. Mutual funds: contact AMC. If nominee registered, simpler process. Otherwise succession certificate needed. Physical shares need separate transfer process.",
      documents: ["Death certificate", "Transmission request form", "Nominee's demat account details", "Succession certificate (if no nominee)", "Notarised affidavit"],
      timeline: "15-30 days (with nominee) to 6 months (without nominee, court process needed)",
      phase: "medium",
      where: "Stockbroker / Depository Participant / AMC office",
    });
  }

  if (assets.some((a) => a.includes("bank"))) {
    tasks.push({
      task: "Claim bank account balances, FDs, and locker contents",
      details: "Process depends on: (1) Nominee exists: claim with death certificate + nominee ID, banks pay up to Rs 5-20 lakh on indemnity. (2) No nominee: succession certificate mandatory for amounts above Rs 5 lakh. Joint accounts with survivorship clause pass automatically.",
      documents: ["Death certificate (multiple copies)", "Succession certificate / Probate", "Nominee's ID and claim form", "Indemnity bond (bank format)", "All passbooks and FD receipts"],
      timeline: "With nominee: 7-15 days. Without nominee: after succession certificate (6-12 months)",
      phase: "medium",
      where: "Respective bank branches",
    });
  }

  // NRI-specific tasks
  if (hasNri) {
    tasks.push({
      task: "NRI Heir: Execute Power of Attorney at Indian Consulate",
      details: "NRI heir who cannot be physically present for all proceedings needs to execute POA in favour of a trusted person in India. POA must be executed at Indian consulate/embassy abroad and apostilled/attested. Specific POA (listing exact acts authorized) is safer than general POA.",
      documents: ["NRI's passport copy", "Aadhaar (if available)", "POA draft (prepared by Indian advocate)", "Consulate attestation fee", "Two witnesses at consulate"],
      timeline: "Execute before any property/court proceedings. Consulate appointment: 1-4 weeks.",
      phase: "short",
      where: "Indian Consulate/Embassy in country of NRI residence",
    });

    tasks.push({
      task: "NRI Heir: FEMA compliance for property and fund repatriation",
      details: "Sale proceeds of inherited property can be repatriated subject to FEMA rules: up to USD 1 million per financial year through authorized dealer (bank). Inherited funds must be credited to NRO account first, then repatriated. Capital gains tax applies on property sale. CA certificate (Form 15CB) needed.",
      documents: ["NRO account in Indian bank", "CA Certificate (Form 15CB)", "Form 15CA (online filing)", "Succession certificate", "Sale deed (if property sold)", "Tax payment challan"],
      timeline: "After property sale or fund release. Repatriation: 7-15 working days after all documents filed.",
      phase: "long",
      where: "Authorized Dealer bank (bank holding NRO account)",
    });

    tasks.push({
      task: "NRI Heir: Obtain PAN card if not already held",
      details: "PAN is mandatory for property transactions, bank claims above threshold, and tax compliance in India. NRIs can apply online through NSDL/UTIITSL portal. Required before any property mutation or sale.",
      documents: ["Passport copy (attested)", "Overseas address proof", "Photograph", "Form 49AA"],
      timeline: "15-20 days for dispatch (physical PAN). E-PAN available in 48 hours.",
      phase: "short",
      where: "NSDL / UTIITSL portal (online application)",
    });
  }

  // LONG-TERM
  tasks.push({
    task: "Register transfer deed / family settlement (if property to be divided)",
    details: `If multiple heirs agree on division, execute a Family Settlement Deed (registered) or Partition Deed. If not agreed, file partition suit in civil court. Stamp duty applies (varies by state: ${state}).`,
    documents: ["Succession certificate / Probate", "All heirs' consent", "Property valuation", "Stamp duty payment", "Registration fee"],
    timeline: "After succession certificate obtained. Registration: 1-2 days. Court partition: 2-5 years.",
    phase: "long",
    where: "Sub-Registrar office (consensual) / Civil Court (contested)",
  });

  tasks.push({
    task: "Close/transfer vehicle RC, utility connections, and subscriptions",
    details: "Vehicle RC transfer (Form 31 at RTO), electricity/gas connection name change, phone/broadband transfer, subscription cancellations. Each has its own process but most need death certificate + heir proof.",
    documents: ["Death certificate", "RC book (vehicle)", "Legal heir certificate", "New owner's ID and address proof"],
    timeline: "Within 6 months (vehicle has 12-month deadline for transfer)",
    phase: "long",
    where: "RTO (vehicle) / Electricity office / respective service providers",
  });

  return tasks;
}

export function run(input: RunInput): RunResult {
  const state = (input.state ?? "").trim();
  const religion = (input.religion ?? "").trim();
  const assetsRaw = (input.assets ?? "").trim();
  const hasWill = (input.hasWill ?? "").trim();
  const numHeirsStr = (input.numHeirs ?? "").trim();
  const hasNriHeirRaw = (input.hasNriHeir ?? "").trim();

  if (!state) throw new Error("Select the state where the deceased resided (determines court jurisdiction and procedures).");
  if (!religion) throw new Error("Select religion (determines which succession law applies: Hindu, Muslim, Christian, or Parsi).");
  if (!assetsRaw) throw new Error("Enter asset types (property, bank accounts, insurance, shares, PF/pension, etc.).");
  if (!hasWill) throw new Error("Specify whether there is a will (registered, unregistered, or no will).");
  if (!numHeirsStr) throw new Error("Enter the number of legal heirs.");
  if (!hasNriHeirRaw) throw new Error("Specify whether any heir is an NRI (affects POA and FEMA requirements).");

  const numHeirs = Number(numHeirsStr);
  if (isNaN(numHeirs) || numHeirs < 1) throw new Error("Number of legal heirs must be at least 1.");
  const hasNri = hasNriHeirRaw === "Yes";
  const assets = assetsRaw.split(",").map((a) => a.trim().toLowerCase()).filter((a) => a.length > 0);

  const succession = SUCCESSION_LAW[religion];
  if (!succession) throw new Error(`Religion "${religion}" not supported. Choose Hindu, Muslim, Christian, or Parsi.`);

  const checklist = buildChecklist(state, religion, assets, hasWill, numHeirs, hasNri);

  const immediate = checklist.filter((t) => t.phase === "immediate");
  const short = checklist.filter((t) => t.phase === "short");
  const medium = checklist.filter((t) => t.phase === "medium");
  const long = checklist.filter((t) => t.phase === "long");

  const willStatus = hasWill.includes("registered") ? "Registered will (probate path)" : hasWill.includes("unregistered") ? "Unregistered will (probate recommended)" : "No will (intestate succession)";

  const headline = `${checklist.length} action items for estate administration | ${succession.act.split(",")[0]} applies | ${willStatus} | ${numHeirs} heirs${hasNri ? " (incl. NRI)" : ""} | ${assets.length} asset types. Start with immediate tasks (death certificate, bank intimation).`;

  return {
    headline,
    score: {
      label: "Complexity",
      value: Math.min(100, checklist.length * 5 + (hasNri ? 20 : 0) + (hasWill.includes("No") ? 15 : 0)),
      max: 100,
      band: checklist.length > 15 ? "bad" : checklist.length > 10 ? "warn" : "good",
    },
    metrics: [
      { label: "Total tasks", value: String(checklist.length), hint: `${immediate.length} immediate` },
      { label: "Succession law", value: religion, hint: succession.act.split(",")[0] },
      { label: "Legal heirs", value: String(numHeirs), hint: hasNri ? "Includes NRI" : "All resident" },
      { label: "Assets", value: String(assets.length), hint: assets.slice(0, 3).join(", ") },
    ],
    sections: [
      {
        title: "Applicable Succession Law",
        items: [
          { title: succession.act, body: succession.description, severity: "low" as Severity },
          { title: "Inheritance Shares", body: succession.shares, severity: "low" as Severity },
          { title: "Legal Process", body: succession.process, severity: "medium" as Severity },
        ],
      },
      {
        title: "IMMEDIATE (0-7 Days)",
        items: immediate.map((t) => ({
          title: t.task,
          body: `${t.details}\n\nDocuments: ${t.documents.join("; ")}\nTimeline: ${t.timeline}\nWhere: ${t.where}`,
          severity: "high" as Severity,
          tag: "urgent",
        })),
      },
      {
        title: "SHORT-TERM (7-30 Days)",
        items: short.map((t) => ({
          title: t.task,
          body: `${t.details}\n\nDocuments: ${t.documents.join("; ")}\nTimeline: ${t.timeline}\nWhere: ${t.where}`,
          severity: "medium" as Severity,
        })),
      },
      {
        title: "MEDIUM-TERM (1-6 Months)",
        items: medium.map((t) => ({
          title: t.task,
          body: `${t.details}\n\nDocuments: ${t.documents.join("; ")}\nTimeline: ${t.timeline}\nWhere: ${t.where}`,
          severity: "low" as Severity,
        })),
      },
      {
        title: "LONG-TERM (6-18 Months)",
        items: long.map((t) => ({
          title: t.task,
          body: `${t.details}\n\nDocuments: ${t.documents.join("; ")}\nTimeline: ${t.timeline}\nWhere: ${t.where}`,
          severity: "low" as Severity,
        })),
      },
      ...(hasNri ? [{
        title: "NRI-Specific Complications",
        items: [
          { title: "Power of Attorney must be executed at Indian Consulate", body: "Without POA, NRI heir must be physically present for every court hearing, bank visit, and registration. Specific POA listing exact acts is recommended.", severity: "high" as Severity },
          { title: "FEMA regulations restrict repatriation", body: "Property sale proceeds go to NRO account first. Repatriation limited to USD 1M/year with CA certificate (Form 15CB). Agricultural land cannot be held by NRI.", severity: "medium" as Severity },
          { title: "Tax residency complications", body: "NRI heir may become 'deemed resident' if Indian income exceeds Rs 15 lakh and global income is not taxed elsewhere. Consult CA for DTAA benefits.", severity: "medium" as Severity },
        ],
      }] : []),
    ],
    table: {
      columns: ["Phase", "Task", "Timeline", "Where"],
      rows: checklist.map((t) => [
        t.phase === "immediate" ? "0-7 days" : t.phase === "short" ? "7-30 days" : t.phase === "medium" ? "1-6 months" : "6-18 months",
        t.task,
        t.timeline.split(".")[0],
        t.where.split("/")[0].trim(),
      ]),
    },
    json: {
      state,
      religion,
      successionLaw: succession,
      assets,
      hasWill: willStatus,
      numHeirs,
      hasNri,
      totalTasks: checklist.length,
      phases: { immediate: immediate.length, short: short.length, medium: medium.length, long: long.length },
      checklist: checklist.map((t) => ({
        task: t.task,
        phase: t.phase,
        timeline: t.timeline,
        documents: t.documents,
        where: t.where,
      })),
    },
  };
}
