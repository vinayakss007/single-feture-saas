import type { ResultItem, RunInput, RunResult, Severity } from "./types.ts";

/**
 * Composes a SOC 2 / ISO 27001 policy set from a company profile.
 *
 * Deterministic template composition, not generation. That matters for a reason
 * specific to this domain: an auditor comparing this year's access control policy
 * to last year's should see only the changes you intended. A model that rewords
 * three paragraphs it was not asked to touch turns every regeneration into a
 * review burden and, worse, into a question about what else changed.
 *
 * The other deliberate choice is that this refuses to overstate. Controls a company
 * of the stated size cannot satisfy are reported as such, and the gap list is
 * ordered by what an auditor tests first. A policy asserting a control you do not
 * operate is a documented control failure — strictly worse than having no policy.
 */

type Policy = {
  id: string;
  name: string;
  tsc: string[];
  iso: string[];
  purpose: string;
  evidence: string[];
};

type Gap = {
  what: string;
  why: string;
  effort: "hours" | "days" | "weeks";
  severity: Severity;
  /** auditors test these in roughly this order */
  order: number;
};

const SIZE_RANK: Record<string, number> = { "1–5": 1, "6–20": 2, "21–100": 3, "101–500": 4, "500+": 5 };

// ---------------------------------------------------------------------------
// The policy set
// ---------------------------------------------------------------------------

function policySet(input: RunInput): Policy[] {
  const cloud = input.cloud ?? "AWS";
  const size = SIZE_RANK[input.headcount ?? "6–20"] ?? 2;

  const base: Policy[] = [
    {
      id: "ISP",
      name: "Information Security Policy",
      tsc: ["CC1.1", "CC1.2", "CC2.2", "CC5.3"],
      iso: ["A.5.1", "A.5.2", "A.5.4"],
      purpose:
        "The umbrella document. States who owns security, that management has approved the programme, and that everyone is accountable to it. Every other policy hangs off this one, and it is the first thing an auditor asks for.",
      evidence: [
        "Signed approval by a named executive, dated",
        "Evidence every employee acknowledged it, with dates",
        "Review record showing it was revisited within the last twelve months",
      ],
    },
    {
      id: "AC",
      name: "Access Control Policy",
      tsc: ["CC6.1", "CC6.2", "CC6.3", "CC6.6"],
      iso: ["A.5.15", "A.5.16", "A.5.17", "A.5.18", "A.8.2", "A.8.5"],
      purpose:
        "Who gets access to what, on what basis, and how it is removed. This is the most heavily tested area in any SOC 2 audit, because it is where breaches actually come from.",
      evidence: [
        "Current user access list per production system, exported and dated",
        "Approval records for each access grant",
        "Proof MFA is enforced, not merely available",
        `Quarterly access review records${size >= 3 ? "" : " — semi-annual is defensible below 20 people if the policy says so"}`,
        "Removal evidence for every leaver, within the stated SLA",
      ],
    },
    {
      id: "CM",
      name: "Change Management Policy",
      tsc: ["CC8.1"],
      iso: ["A.8.32", "A.8.31"],
      purpose:
        "How code reaches production: review, testing, approval and rollback. Auditors sample pull requests against this, so what it says must match what your repository shows.",
      evidence: [
        "Sample of merged pull requests showing a reviewer other than the author",
        "Branch protection settings screenshot",
        "CI results attached to those changes",
        "One documented rollback or incident-driven change",
      ],
    },
    {
      id: "IR",
      name: "Incident Response Plan",
      tsc: ["CC7.3", "CC7.4", "CC7.5"],
      iso: ["A.5.24", "A.5.25", "A.5.26", "A.5.27"],
      purpose:
        "What happens when something goes wrong: who is called, how severity is decided, when customers and regulators are told. Both GDPR's 72-hour clock and India's DPDP notification duty live here.",
      evidence: [
        "Named on-call rota with contact details",
        "Severity definitions with response time targets",
        "At least one post-incident review, even for a minor incident",
        "Evidence of a tabletop exercise if no real incident occurred",
      ],
    },
    {
      id: "VM",
      name: "Vendor and Third-Party Risk Policy",
      tsc: ["CC9.2"],
      iso: ["A.5.19", "A.5.20", "A.5.21", "A.5.22"],
      purpose:
        "How you assess and monitor subprocessors. Now a standard questionnaire item in its own right, because your buyer's risk includes your vendors' risk.",
      evidence: [
        "Vendor inventory with data shared and hosting region per vendor",
        "Security review record for each critical vendor",
        "Signed DPAs where personal data is shared",
        "Annual re-review evidence",
      ],
    },
    {
      id: "BC",
      name: "Business Continuity and Disaster Recovery Plan",
      tsc: ["A1.2", "A1.3"],
      iso: ["A.5.29", "A.5.30", "A.8.13", "A.8.14"],
      purpose:
        "Stated RTO and RPO, and how you would actually meet them. The control that fails most often, because backups exist and restores are never tested.",
      evidence: [
        "Documented RTO and RPO per system",
        "Backup configuration screenshot showing schedule and retention",
        "A dated restore test with its result — this is the one auditors always ask for",
        "Annual plan review record",
      ],
    },
    {
      id: "SDLC",
      name: "Secure Development Policy",
      tsc: ["CC8.1", "CC7.1"],
      iso: ["A.8.25", "A.8.26", "A.8.27", "A.8.28"],
      purpose:
        "Secure coding expectations, dependency scanning, secret management, and how security defects are triaged. Ties your engineering practice to the control framework.",
      evidence: [
        "Dependency scanning output and evidence findings were triaged",
        "Secret scanning configuration",
        "Proof secrets are in a manager, not in the repository",
        "Security training record for engineers",
      ],
    },
    {
      id: "RA",
      name: "Risk Assessment and Treatment",
      tsc: ["CC3.1", "CC3.2", "CC3.3", "CC3.4"],
      iso: ["A.5.7", "Clause 6.1", "Clause 8.2"],
      purpose:
        "A register of your risks, scored, with an owner and a treatment decision. ISO 27001 will not certify without it and SOC 2 tests that it exists and is used.",
      evidence: [
        "Risk register with likelihood, impact, owner and treatment",
        "Evidence of review within the last twelve months",
        "Documented risk acceptance decisions signed by management",
      ],
    },
    {
      id: "DC",
      name: "Data Classification and Handling Policy",
      tsc: ["CC6.7", "C1.1", "C1.2"],
      iso: ["A.5.12", "A.5.13", "A.5.14", "A.8.10", "A.8.12"],
      purpose:
        "What data you hold, how sensitive it is, and the handling rules per class — including encryption, retention and deletion.",
      evidence: [
        "Data inventory mapped to classification levels",
        "Encryption at rest and in transit configuration",
        "Retention schedule and evidence deletion actually happens",
      ],
    },
    {
      id: "HR",
      name: "Human Resources Security Policy",
      tsc: ["CC1.4", "CC1.5", "CC2.2"],
      iso: ["A.6.1", "A.6.2", "A.6.3", "A.6.5", "A.6.6"],
      purpose:
        "Background checks, confidentiality agreements, security training, and the onboarding and offboarding process. Offboarding is where auditors find the gap.",
      evidence: [
        "Signed confidentiality agreements for all staff",
        "Background check records where the policy requires them",
        "Security awareness training completion records",
        "Completed offboarding checklists for every leaver in the period",
      ],
    },
    {
      id: "MON",
      name: "Logging and Monitoring Policy",
      tsc: ["CC7.1", "CC7.2"],
      iso: ["A.8.15", "A.8.16", "A.8.17"],
      purpose:
        "What is logged, where it goes, how long it is kept, and who looks at alerts. Without stated retention this control cannot be tested at all.",
      evidence: [
        "Log retention configuration showing the period",
        "Alert routing configuration",
        "Sample of alerts investigated, with outcomes",
      ],
    },
    {
      id: "AUP",
      name: "Acceptable Use and Endpoint Policy",
      tsc: ["CC6.7", "CC6.8"],
      iso: ["A.5.10", "A.6.7", "A.8.1", "A.8.7"],
      purpose:
        "Rules for company and personal devices touching company data: disk encryption, screen lock, patching, malware protection, and remote working.",
      evidence: [
        "Device inventory",
        "Disk encryption status per device",
        "Patch compliance report",
        "Signed acceptable use acknowledgements",
      ],
    },
  ];

  // Region and data pull in extra documents. These are additions, not variants.
  const region = input.region ?? "India only";
  const dataTypes = (input.dataTypes ?? "").toLowerCase();

  if (region.includes("EU") || region === "Global") {
    base.push({
      id: "GDPR",
      name: "GDPR Data Protection Policy and Records of Processing",
      tsc: ["P1.1", "P4.1", "P6.1"],
      iso: ["A.5.34", "A.8.11"],
      purpose:
        "Lawful basis per processing activity, data subject rights procedures, the Article 30 record of processing, and international transfer mechanisms. Required because you have EU customers, independent of any certification.",
      evidence: [
        "Article 30 record of processing activities",
        "Lawful basis documented per activity",
        "Data subject request procedure and any requests handled, with dates",
        "Transfer impact assessment and SCCs for non-EU processors",
      ],
    });
  }
  if (region.includes("India") || region === "Global") {
    base.push({
      id: "DPDP",
      name: "DPDP Act Compliance Policy",
      tsc: ["P1.1", "P8.1"],
      iso: ["A.5.34"],
      purpose:
        "Consent notices, Data Principal rights, breach notification to the Data Protection Board, and consent manager arrangements under India's Digital Personal Data Protection Act.",
      evidence: [
        "Consent notice text as presented to users",
        "Consent records with timestamps",
        "Grievance officer appointment and contact details published",
        "Breach notification procedure naming the Board",
      ],
    });
  }
  if (/\bcard\b|payment|\bpci\b|credit card/.test(dataTypes)) {
    base.push({
      id: "PCI",
      name: "Payment Data Handling Statement",
      tsc: ["CC6.7", "C1.1"],
      iso: ["A.8.10", "A.8.11"],
      purpose:
        "Documents your PCI DSS scope. Using a hosted payment provider so full card numbers never touch your systems is a control decision worth writing down explicitly — it is what keeps you on SAQ A.",
      evidence: [
        "Confirmation that card data never reaches your servers",
        "Your payment provider's current AOC or PCI certificate",
        "Completed self-assessment questionnaire for your scope",
      ],
    });
  }
  if (/health|medical|patient|diagnos/.test(dataTypes)) {
    base.push({
      id: "PHI",
      name: "Health Data Handling Policy",
      tsc: ["C1.1", "P2.1"],
      iso: ["A.5.12", "A.8.11"],
      purpose:
        "Health data is a special category under GDPR Article 9 and sensitive personal data under DPDP. It needs an explicit lawful basis, tighter access control and its own retention rules.",
      evidence: [
        "Explicit consent or other Article 9 condition documented",
        "Access restricted to a named, minimal group",
        "Separate retention and deletion schedule",
      ],
    });
  }

  // Cloud-specific evidence, so the pack names the console you will screenshot.
  const cloudEvidence: Record<string, string> = {
    AWS: "AWS IAM credential report, CloudTrail configuration, and S3 bucket encryption settings",
    "Google Cloud": "GCP IAM policy export, Cloud Audit Logs configuration, and CMEK settings",
    "Microsoft Azure": "Entra ID sign-in logs, Azure Policy compliance state, and disk encryption settings",
    "Multiple clouds": "IAM and audit log evidence from each cloud, plus a statement of which workloads run where",
    "Own data centre": "Physical access logs, rack access records, and environmental controls evidence",
    "Fully serverless (Vercel, Cloudflare)": "Platform team member list, deployment protection settings, and your provider's SOC 2 report",
  };
  const accessPolicy = base.find((p) => p.id === "AC");
  if (accessPolicy) accessPolicy.evidence.push(cloudEvidence[cloud] ?? cloudEvidence.AWS!);

  return base;
}

// ---------------------------------------------------------------------------
// Gaps
// ---------------------------------------------------------------------------

function gaps(input: RunInput): Gap[] {
  const list: Gap[] = [];
  const size = SIZE_RANK[input.headcount ?? "6–20"] ?? 2;

  if (input.hasMfa === "No") {
    list.push({
      what: "Enforce MFA on every production system and every admin account",
      why: "The single most tested control in any audit, and the one that most often causes a qualified opinion. 'Available but not enforced' counts as not implemented.",
      effort: "hours",
      severity: "high",
      order: 1,
    });
  } else if (input.hasMfa === "Some systems") {
    list.push({
      what: "Extend MFA to the remaining production systems, then export proof of enforcement",
      why: "Partial MFA fails the control. An auditor asks for the enforcement setting, not a list of who happens to have it turned on. Find the gap now rather than during fieldwork.",
      effort: "hours",
      severity: "high",
      order: 1,
    });
  }

  if (input.hasOnboarding === "No") {
    list.push({
      what: "Write onboarding and offboarding checklists and use them from today",
      why: "Offboarding is where auditors reliably find failures: a leaver whose access was never revoked is a finding with a name and a date attached.",
      effort: "hours",
      severity: "high",
      order: 2,
    });
  } else if (input.hasOnboarding === "It exists but is informal") {
    list.push({
      what: "Make the offboarding checklist a recorded artefact per leaver",
      why: "An informal process leaves no evidence. The control is not that you remove access — it is that you can prove you removed it, for every leaver in the period.",
      effort: "hours",
      severity: "high",
      order: 2,
    });
  }

  if (input.hasBackups === "No backups") {
    list.push({
      what: "Configure automated backups with documented retention, then test a restore",
      why: "Availability criteria cannot be met without this, and no compensating control substitutes for it.",
      effort: "days",
      severity: "high",
      order: 3,
    });
  } else if (input.hasBackups === "Backups exist but were never restored") {
    list.push({
      what: "Perform and document one restore test",
      why: "An untested backup is a hypothesis. Auditors ask for the restore test specifically because so many organisations discover at that moment that their backups are unusable. Half a day of work, and it removes the most common finding there is.",
      effort: "hours",
      severity: "high",
      order: 3,
    });
  }

  if (input.hasPentest === "No") {
    list.push({
      what: "Commission a third-party penetration test",
      why: "Not strictly mandatory for SOC 2, but expected by nearly every enterprise buyer and by ISO 27001 A.8.8 in practice. Lead times run to weeks, so start early.",
      effort: "weeks",
      severity: "medium",
      order: 6,
    });
  } else if (input.hasPentest === "Internal testing only") {
    list.push({
      what: "Get an independent test to complement internal testing",
      why: "Independence is the point. Your own team testing your own system does not satisfy a reviewer who is assessing whether you can find your own blind spots.",
      effort: "weeks",
      severity: "medium",
      order: 6,
    });
  }

  // Always required, regardless of answers.
  list.push(
    {
      what: "Set and document log retention",
      why: "A logging control with no stated retention period cannot be tested. Pick a period, configure it, screenshot it. One hour of work.",
      effort: "hours",
      severity: "medium",
      order: 4,
    },
    {
      what: "Build the risk register",
      why: "ISO 27001 will not certify without one and SOC 2 tests that it is used, not merely present. Ten to fifteen real risks with an owner and a treatment decision is enough to start.",
      effort: "days",
      severity: "high",
      order: 5,
    },
    {
      what: "Get every policy formally approved and acknowledged",
      why: "An unapproved, unacknowledged policy is a draft. Signature and acknowledgement dates are evidence in their own right, and they must predate your observation window.",
      effort: "hours",
      severity: "high",
      order: 7,
    },
    {
      what: "Start the observation window and mark the date",
      why: "A Type II is an opinion on controls operating over a period an auditor observed. That period can only be started, never backdated — so the day your controls are actually in place is the day the clock starts. Three months minimum, six is more common.",
      effort: "hours",
      severity: "high",
      order: 8,
    },
  );

  if (size >= 3) {
    list.push({
      what: "Run quarterly access reviews with a recorded outcome",
      why: `At ${input.headcount} people, auditors expect quarterly reviews with evidence of who reviewed what and what changed.`,
      effort: "hours",
      severity: "medium",
      order: 9,
    });
  }

  return list.sort((a, b) => a.order - b.order);
}

/** Controls a company of this size honestly cannot fully satisfy. */
function sizeLimits(input: RunInput): string[] {
  const size = SIZE_RANK[input.headcount ?? "6–20"] ?? 2;
  const out: string[] = [];

  if (size <= 2) {
    out.push(
      "Separation of duties (CC6.3, A.5.3). With this headcount the same person will deploy and approve. Document a compensating control — mandatory pull request review by any second person, plus alerting on self-merges — and state the limitation explicitly. Asserting separation you do not have is a documented control failure.",
      "A dedicated security function (CC1.3). Name a security owner alongside their other role. Auditors accept a shared role; they do not accept nobody being accountable.",
      "24/7 monitoring coverage (CC7.2). State your actual hours and your alerting arrangements outside them, rather than implying continuous staffing.",
    );
  }
  if (size <= 3) {
    out.push(
      "Formal internal audit (A.9.2). Below roughly 100 people, a documented management review with evidence is the accepted substitute for an independent internal audit function.",
    );
  }
  if (out.length === 0) {
    out.push("At this headcount no control is out of reach on size grounds. Every gap above is a matter of doing the work.");
  }
  return out;
}

// ---------------------------------------------------------------------------
// One policy, written out in full
// ---------------------------------------------------------------------------

function accessControlPolicy(input: RunInput): string {
  const company = (input.company ?? "The Company").trim();
  const cloud = input.cloud ?? "AWS";
  const size = SIZE_RANK[input.headcount ?? "6–20"] ?? 2;
  const reviewCadence = size >= 3 ? "quarterly" : "every six months";
  const smallTeamNote =
    size <= 2
      ? `\n### 4.4 Separation of duties limitation\n\n${company} has fewer than six staff, so full separation of duties between change author and change approver is not achievable. ${company} accepts this limitation and operates the following compensating controls: all production changes require review by a second person; self-approval is blocked by branch protection; and any override is alerted to the Security Owner. This limitation is reviewed whenever headcount changes materially.\n`
      : "";

  return `# Access Control Policy

**${company}**
Document ID: AC-001 · Version 1.0 · Owner: Security Owner
Approved by: [name, title] on [date]
Next review: [date, within 12 months]

## 1. Purpose

This policy defines how access to ${company} systems and data is granted, reviewed and revoked. It exists to ensure that access is limited to what each person needs to do their job, and that access is removed promptly when it is no longer needed.

## 2. Scope

This policy applies to all employees, contractors and third parties, and to all ${company} production systems, including ${cloud}, source control, the customer database, and any system holding customer data.

## 3. Principles

1. **Least privilege.** Access is granted at the minimum level required for the role.
2. **Need to know.** Access to customer data requires a documented business reason.
3. **Individual accountability.** Accounts are not shared. Every action is attributable to a person.
4. **Default deny.** Access does not exist until it is explicitly granted and approved.

## 4. Access management

### 4.1 Granting access

Access requests are raised in writing and approved by the system owner before provisioning. The request records the person, the system, the level of access and the business reason. Approval records are retained for the life of the account plus one year.

### 4.2 Authentication

Multi-factor authentication is **enforced** — not merely available — on all production systems, all administrative accounts, source control, and the identity provider. Password requirements follow the current NIST guidance: a minimum of 12 characters, checked against known-breached password lists, with no mandatory rotation in the absence of evidence of compromise.

### 4.3 Privileged access

Administrative access is granted to the smallest possible group and is separate from day-to-day accounts. Privileged actions are logged and the log is retained per the Logging and Monitoring Policy.
${smallTeamNote}
## 5. Access review

A review of all access to production systems is performed **${reviewCadence}**. The review is performed by the Security Owner together with each system owner, and records: who was reviewed, what was found, what was changed, and who approved the outcome. Accounts that are no longer required are removed as part of the review.

## 6. Revocation

Access is revoked within **one business day** of a person leaving or changing role. Revocation is recorded on the offboarding checklist for that person, covering: identity provider, ${cloud}, source control, communication tools, and any system-specific credentials. Shared credentials the person had knowledge of are rotated.

## 7. Third-party access

Third parties are granted access only under a signed agreement that includes confidentiality and security obligations, only for the duration required, and are subject to the same review and revocation requirements as staff.

## 8. Exceptions

Exceptions require written approval from the Security Owner, must record the compensating control and an expiry date, and are reviewed at each access review.

## 9. Enforcement

Failure to comply may result in withdrawal of access and disciplinary action.

## 10. Related documents

Information Security Policy (ISP-001) · Human Resources Security Policy (HR-001) · Logging and Monitoring Policy (MON-001) · Vendor and Third-Party Risk Policy (VM-001)

## 11. Revision history

| Version | Date | Change | Author |
|---|---|---|---|
| 1.0 | [date] | Initial issue | [name] |
`;
}

// ---------------------------------------------------------------------------
// run
// ---------------------------------------------------------------------------

export async function run(input: RunInput): Promise<RunResult> {
  const company = (input.company ?? "").trim();
  if (!company) throw new Error("Give the company's legal name — it appears on every policy.");
  const dataTypes = (input.dataTypes ?? "").trim();
  if (dataTypes.length < 15) {
    throw new Error(
      "Describe the data you hold in at least a sentence. Data classification drives half the policy set, so a vague answer would produce a policy set that does not fit you.",
    );
  }

  const framework = input.framework ?? "Both";
  const policies = policySet(input);
  const gapList = gaps(input);
  const limits = sizeLimits(input);

  const blockers = gapList.filter((g) => g.severity === "high");
  const quickWins = gapList.filter((g) => g.effort === "hours");

  const tscCount = new Set(policies.flatMap((p) => p.tsc)).size;
  const isoCount = new Set(policies.flatMap((p) => p.iso)).size;
  const evidenceCount = policies.reduce((s, p) => s + p.evidence.length, 0);

  // Readiness: policies are the easy half. Weighting them equally with the gaps
  // would let someone score 90% by generating documents and doing nothing.
  const readiness = Math.max(0, Math.round(100 - blockers.length * 11 - (gapList.length - blockers.length) * 3));

  const sections: { title: string; items: ResultItem[] }[] = [
    {
      title: `Policy set — ${policies.length} documents`,
      items: policies.map((p) => ({
        title: `${p.id} · ${p.name}`,
        body: `${p.purpose}\n\nEvidence an auditor will ask for:\n${p.evidence.map((e) => `  • ${e}`).join("\n")}`,
        tag:
          framework === "SOC 2 Type II"
            ? p.tsc.join(", ")
            : framework === "ISO 27001:2022"
              ? p.iso.join(", ")
              : `${p.tsc.join(", ")} | ${p.iso.slice(0, 3).join(", ")}`,
        severity: "low" as Severity,
      })),
    },
    {
      title: `Gap list — ${blockers.length} blocking, ${gapList.length} total`,
      items: gapList.map((g) => ({
        title: g.what,
        body: g.why,
        tag: `${g.effort} · auditor priority ${g.order}`,
        severity: g.severity,
      })),
    },
    {
      title: "Controls your size cannot fully satisfy — document, do not assert",
      items: limits.map((l) => ({ body: l, severity: "medium" as Severity })),
    },
    {
      title: "What documents cannot do",
      items: [
        {
          body: "A SOC 2 Type II is an auditor's opinion that your controls operated effectively over an observation window, typically three to twelve months. That window cannot be created retroactively — only started. Generating these policies today does not start it; implementing the gap list does.",
          severity: "high",
        },
        {
          body: "Every policy here will be tested against evidence. A policy asserting a control you do not operate is worse than no policy, because it converts an omission into a documented control failure. That is why the gap list is not optional reading.",
          severity: "high",
        },
        {
          body: `You will need a licensed CPA firm for SOC 2, or an accredited certification body for ISO 27001. This is readiness work, not the audit. Typical first-audit cost runs ₹4–12 lakh depending on scope.`,
          severity: "medium",
        },
      ],
    },
  ];

  return {
    headline: `${policies.length} policies covering ${tscCount} Trust Services Criteria and ${isoCount} ISO 27001 controls. ${blockers.length} blocking gaps to close first — ${quickWins.length} of them are hours of work.`,

    score: { label: "Audit readiness", value: readiness, max: 100, band: readiness >= 70 ? "good" : readiness >= 40 ? "warn" : "bad" },

    metrics: [
      { label: "Policies", value: String(policies.length) },
      { label: "Blocking gaps", value: String(blockers.length), hint: `${quickWins.length} takeable in hours` },
      { label: "TSC covered", value: String(tscCount) },
      { label: "ISO controls", value: String(isoCount) },
      { label: "Evidence items", value: String(evidenceCount), hint: "what you will be asked for" },
    ],

    sections,

    table: {
      columns: ["ID", "Policy", "SOC 2 TSC", "ISO 27001:2022", "Evidence items"],
      rows: policies.map((p) => [p.id, p.name, p.tsc.join(", "), p.iso.join(", "), String(p.evidence.length)]),
    },

    copyBlocks: [
      { title: "Access Control Policy — complete, ready to adopt", text: accessControlPolicy(input), language: "markdown" },
      {
        title: "Control mapping and gap list",
        text: [
          `# ${company} — control mapping`,
          "",
          `Target framework: ${framework}`,
          `Headcount: ${input.headcount} · Cloud: ${input.cloud} · Customers: ${input.region}`,
          "",
          "## Policies",
          "",
          "| ID | Policy | SOC 2 TSC | ISO 27001:2022 |",
          "|---|---|---|---|",
          ...policies.map((p) => `| ${p.id} | ${p.name} | ${p.tsc.join(", ")} | ${p.iso.join(", ")} |`),
          "",
          "## Gap list, in the order an auditor tests",
          "",
          ...gapList.map((g, i) => `${i + 1}. **${g.what}** (${g.effort}, ${g.severity})\n   ${g.why}`),
          "",
          "## Documented limitations",
          "",
          ...limits.map((l) => `- ${l}`),
        ].join("\n"),
        language: "markdown",
      },
    ],

    json: {
      company,
      framework,
      readiness,
      policies,
      gaps: gapList,
      documentedLimitations: limits,
      counts: { policies: policies.length, tsc: tscCount, iso: isoCount, evidence: evidenceCount, blockingGaps: blockers.length },
    },
  };
}
