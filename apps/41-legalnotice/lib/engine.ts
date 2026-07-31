import type { RunInput, RunResult, Severity } from "./types.ts";

/**
 * LegalNotice engine - Generates a properly structured legal notice under
 * Indian law with correct sections, timeline, and consequences.
 */

type DisputeConfig = {
  sections: string[];
  mandatoryDeadline: number;
  consequences: string[];
  preRequisites: string[];
  courtForum: string;
  limitationPeriod: string;
  withoutPrejudice: boolean;
  dispatchNote: string;
};

const DISPUTE_CONFIG: Record<string, DisputeConfig> = {
  "Cheque bounce": {
    sections: [
      "Section 138 of the Negotiable Instruments Act, 1881 (Dishonour of cheque for insufficiency of funds)",
      "Section 141 of the NI Act (Offences by companies - director/partner liability)",
      "Section 142 of the NI Act (Cognizance of offences)",
    ],
    mandatoryDeadline: 15,
    consequences: [
      "Filing a criminal complaint under Section 138 of the NI Act before the jurisdictional Magistrate",
      "Imprisonment up to two years, or fine up to twice the cheque amount, or both",
      "Recovery of the cheque amount along with interest, costs of the complaint and compensation",
    ],
    preRequisites: [
      "Notice must be sent within 30 days of receiving the return memo from the bank",
      "The cheque must have been presented within its validity period (3 months from date on cheque)",
      "The cheque must have been issued for discharge of a legally enforceable debt or liability",
    ],
    courtForum: "Court of Metropolitan Magistrate / Judicial Magistrate First Class at the place where the cheque was presented for encashment",
    limitationPeriod: "Criminal complaint must be filed within 30 days of expiry of the 15-day notice period (extendable by 30 days with sufficient cause under Section 142(b))",
    withoutPrejudice: false,
    dispatchNote: "Send via Registered Post AD to registered office (company) or residence (individual). Also send email copy for immediate attention.",
  },
  "Landlord-tenant": {
    sections: [
      "Transfer of Property Act, 1882 (Section 106 - Duration and termination of lease)",
      "Applicable State Rent Control Act (e.g., Delhi Rent Control Act / Maharashtra Rent Control Act / Karnataka Rent Act)",
      "Section 108 of the Transfer of Property Act (Rights and liabilities of lessor and lessee)",
    ],
    mandatoryDeadline: 30,
    consequences: [
      "Filing an eviction petition before the Rent Controller / Civil Court",
      "Recovery of arrears of rent along with interest and mesne profits",
      "Seeking injunction against unauthorized use / subletting of premises",
    ],
    preRequisites: [
      "Written notice as required under Section 106 TPA (15 days for month-to-month tenancy, per rent period otherwise)",
      "Notice period as specified in the lease agreement, if any",
      "Grounds for eviction must fall under the State Rent Control Act provisions",
    ],
    courtForum: "Rent Controller / Civil Court having territorial jurisdiction over the property",
    limitationPeriod: "3 years for recovery of rent arrears (Article 52, Limitation Act 1963). Eviction can be filed anytime grounds exist.",
    withoutPrejudice: false,
    dispatchNote: "Send via Registered Post AD to the tenanted premises. If tenant has another known address, send there as well.",
  },
  "Employment dispute": {
    sections: [
      "Indian Contract Act, 1872 (Section 73 - Compensation for breach of contract)",
      "Payment of Wages Act, 1936 / Payment of Bonus Act, 1965 (as applicable)",
      "Industrial Disputes Act, 1947 (Section 2(oo) - Retrenchment, Section 25F - Conditions for retrenchment)",
      "The Employees Provident Funds and Miscellaneous Provisions Act, 1952",
    ],
    mandatoryDeadline: 30,
    consequences: [
      "Filing a complaint before the Labour Commissioner / Industrial Tribunal",
      "Approaching the appropriate authority under the Payment of Wages Act",
      "Filing a civil suit for damages for breach of employment contract",
      "Complaint to the EPFO for non-deposit of PF contributions",
    ],
    preRequisites: [
      "Demand must be for legally due amounts (salary, bonus, PF, gratuity, notice pay)",
      "For retrenchment compensation, workman must have been in continuous service for one year",
    ],
    courtForum: "Labour Court / Industrial Tribunal / Civil Court depending on the nature of dispute and employee category",
    limitationPeriod: "3 years for wages (Payment of Wages Act), 5 years for PF (EPF Act). Industrial dispute reference has no fixed limitation but delay can be a defence.",
    withoutPrejudice: true,
    dispatchNote: "Send to the registered office of the company and the HR head / Director personally. Keep copies for Labour Commissioner reference.",
  },
  "Property dispute": {
    sections: [
      "Transfer of Property Act, 1882 (Section 54 - Sale of immovable property)",
      "Specific Relief Act, 1963 (Section 12 - Specific performance of contract)",
      "Indian Registration Act, 1908 (Section 17 - Documents requiring registration)",
      "Real Estate (Regulation and Development) Act, 2016 (RERA) - if applicable to builder disputes",
    ],
    mandatoryDeadline: 30,
    consequences: [
      "Filing a suit for specific performance / cancellation of sale deed",
      "Filing a complaint before RERA authority (for builder disputes)",
      "Seeking injunction to prevent alienation of the disputed property",
      "Recovery of earnest money / advance paid along with interest and damages",
    ],
    preRequisites: [
      "Clear documentation of the transaction (agreement, receipts, correspondence)",
      "Readiness and willingness to perform your part (for specific performance claims)",
      "For RERA complaints, the project must be registered under RERA",
    ],
    courtForum: "Civil Court having pecuniary and territorial jurisdiction / RERA Authority (for builder disputes)",
    limitationPeriod: "3 years from the date of breach (Article 54, Limitation Act 1963 for specific performance). 12 years for possession (Article 65).",
    withoutPrejudice: false,
    dispatchNote: "Send via Registered Post AD to the address in the agreement. For companies/builders, send to registered office as per MCA records.",
  },
  "Consumer complaint": {
    sections: [
      "Consumer Protection Act, 2019 (Section 2(7) - Consumer, Section 2(9) - Defect, Section 2(11) - Deficiency)",
      "Section 34 - District Commission, Section 47 - State Commission, Section 58 - National Commission",
      "Section 35 - Jurisdiction based on value of goods/services and compensation claimed",
    ],
    mandatoryDeadline: 30,
    consequences: [
      "Filing a consumer complaint before the District / State / National Consumer Disputes Redressal Commission",
      "Seeking replacement / refund / compensation for deficiency in service or defect in goods",
      "Claim for mental agony, harassment, and litigation costs",
      "Punitive damages for unfair trade practices",
    ],
    preRequisites: [
      "The complainant must be a 'consumer' as defined under Section 2(7) of the CPA 2019",
      "Complaint must be filed within 2 years of cause of action (Section 69)",
      "Value determines forum: up to Rs 1 crore (District), Rs 1-10 crore (State), above Rs 10 crore (National)",
    ],
    courtForum: "District Consumer Disputes Redressal Commission (up to Rs 1 crore) / State Commission (Rs 1-10 crore) / National Commission (above Rs 10 crore)",
    limitationPeriod: "2 years from the date on which the cause of action arises (Section 69, CPA 2019), extendable if sufficient cause shown",
    withoutPrejudice: false,
    dispatchNote: "Send to the company registered office AND the branch/store where you purchased. Include copies of bills/receipts.",
  },
  "Defamation": {
    sections: [
      "Section 499 and 500 of the Indian Penal Code, 1860 (Criminal Defamation)",
      "Law of Torts - Civil Defamation (Injunction and Damages)",
      "Information Technology Act, 2000 (Section 66A struck down but Section 67 for obscene content online)",
    ],
    mandatoryDeadline: 30,
    consequences: [
      "Filing a criminal complaint for defamation under Section 500 IPC (imprisonment up to 2 years, fine, or both)",
      "Filing a civil suit for damages and permanent injunction",
      "Seeking take-down of defamatory content from online platforms",
      "Exemplary damages for malicious publication",
    ],
    preRequisites: [
      "The statement must be published (communicated to third parties)",
      "It must refer to the complainant (directly or by implication)",
      "It must lower the reputation in the estimation of right-thinking members of society",
      "None of the exceptions under Section 499 IPC should apply (truth for public good, fair comment, etc.)",
    ],
    courtForum: "Court of Metropolitan Magistrate / JMFC for criminal defamation. Civil Court for damages and injunction.",
    limitationPeriod: "Criminal complaint within 3 years (Section 468 CrPC). Civil suit for damages within 1 year (Article 75, Limitation Act).",
    withoutPrejudice: true,
    dispatchNote: "Send via Registered Post AD. For online defamation, also send to the platform (Twitter/X, Facebook, Google) requesting content removal.",
  },
  "Recovery of money": {
    sections: [
      "Indian Contract Act, 1872 (Section 73 - Compensation for breach, Section 74 - Penalty/Liquidated damages)",
      "Order XXXVII of the Code of Civil Procedure (Summary Suit for recovery of money on written instrument)",
      "Limitation Act, 1963 (Article 19 - Account stated, Article 36 - On a bond/promissory note)",
    ],
    mandatoryDeadline: 30,
    consequences: [
      "Filing a civil suit / summary suit for recovery of money along with interest",
      "Filing an application under Order XXXVII CPC for leave to defend (placing burden on debtor)",
      "Seeking attachment before judgment (Order XXXVIII CPC) if debtor likely to dispose assets",
      "Insolvency proceedings under the Insolvency and Bankruptcy Code, 2016 (if amount exceeds Rs 1 crore)",
    ],
    preRequisites: [
      "Documentary evidence of the debt (agreement, invoices, promissory note, emails, ledger entries)",
      "The debt must be legally enforceable and not time-barred",
      "For summary suit, the claim must be based on a written instrument (negotiable instrument, written contract, etc.)",
    ],
    courtForum: "Civil Court having pecuniary jurisdiction (District Court / High Court based on amount). Commercial Court for commercial disputes above Rs 3 lakh.",
    limitationPeriod: "3 years from when the debt becomes due (general). 3 years from date of last acknowledgment if debt was acknowledged in writing (Section 18, Limitation Act).",
    withoutPrejudice: false,
    dispatchNote: "Send via Registered Post AD to registered/last known address. For companies, send to registered office AND directors personally.",
  },
  "Notice to government (Section 80 CPC)": {
    sections: [
      "Section 80 of the Code of Civil Procedure, 1908 (Notice to Government / Public Officer before suit)",
      "Article 300 of the Constitution of India (Suits against the Government)",
      "Limitation Act, 1963 as applicable to the underlying cause of action",
    ],
    mandatoryDeadline: 60,
    consequences: [
      "Filing a civil suit against the Union of India / State Government / Public Officer after expiry of 2 months",
      "Seeking mandamus through writ petition under Article 226 (if fundamental right involved)",
      "Recovery of damages / compensation from the government",
    ],
    preRequisites: [
      "Notice MUST be served 2 months before instituting suit (mandatory, non-compliance makes suit dismissible)",
      "Notice must state: cause of action, name and address of plaintiff, relief claimed, plaint gist",
      "Notice must be delivered to Secretary to Government (Union) or Secretary to State Government / Collector (State)",
      "For public officer, notice to officer AND the government",
    ],
    courtForum: "Civil Court / High Court (writ jurisdiction). District Court or High Court depending on pecuniary jurisdiction.",
    limitationPeriod: "As per the underlying cause of action. Note: the 2-month notice period is excluded from limitation calculation (Section 15(2), Limitation Act).",
    withoutPrejudice: false,
    dispatchNote: "Send via Registered Post AD to the Secretary to Government (specific ministry/department). For State: Secretary to State Government. For public officer: to the officer AND the government. Retain proof of delivery.",
  },
};

const COMMON_MISTAKES: Record<string, string[]> = {
  "Cheque bounce": [
    "Sending notice after 30 days from return memo date (makes complaint non-maintainable)",
    "Not presenting the cheque within 3 months of its date",
    "Sending to wrong address (must be as per bank records or last known address)",
    "Not specifying the exact cheque amount, number, date, and bank",
    "Demanding amount different from cheque face value in the notice",
  ],
  "Landlord-tenant": [
    "Not giving notice period as specified in the lease agreement",
    "Threatening criminal action for what is a civil dispute",
    "Not specifying arrears with exact months and amounts",
    "Sending notice to address other than the tenanted premises",
  ],
  "Employment dispute": [
    "Not exhausting internal grievance mechanism first (weakens case)",
    "Threatening criminal action for salary disputes (it is civil in nature)",
    "Not specifying exact amounts due with calculation basis",
    "Not mentioning PF account number and UAN for PF disputes",
  ],
  "Property dispute": [
    "Not attaching or referencing the agreement/deed details",
    "Claiming specific performance without showing readiness to perform",
    "Not specifying the property with full survey/plot details",
    "Sending to agreement address when party has moved",
  ],
  "Consumer complaint": [
    "Sending notice for commercial purpose purchases (not covered under CPA)",
    "Not specifying bill/invoice number and date of purchase",
    "Demanding unreasonable compensation that weakens credibility",
    "Not giving the company reasonable time to respond",
  ],
  "Defamation": [
    "Not identifying the specific defamatory statements with date and medium",
    "Confusing criticism or opinion with defamation",
    "Not considering if truth is a defence (Section 499 Exception 1)",
    "Not preserving evidence (screenshots, URLs, witnesses) before sending notice",
  ],
  "Recovery of money": [
    "Not specifying the basis of debt (agreement date, invoice numbers, transaction details)",
    "Claiming interest without contractual or statutory basis",
    "Sending notice after limitation period has expired",
    "Not mentioning partial payments already received",
  ],
  "Notice to government (Section 80 CPC)": [
    "Not waiting full 2 months after notice delivery before filing suit",
    "Addressing notice to wrong ministry/department/officer",
    "Not including all mandatory particulars: cause of action, name, address, relief",
    "Filing suit before notice period expires (suit is dismissible)",
    "Not sending to BOTH the government AND the public officer (when suing officer)",
  ],
};

function generateNoticeText(input: RunInput, config: DisputeConfig, deadline: number): string {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  const sections = config.sections.map((s) => s.split(" (")[0]).join(", ");

  const notice = `LEGAL NOTICE

Date: ${dateStr}

To,
${input.recipientName}
${input.recipientAddress}

FROM:
${input.senderName}
${input.senderAddress}

Subject: Legal Notice ${config.withoutPrejudice ? "(Without Prejudice) " : ""}under ${sections}

Sir/Madam,

Under instructions from and on behalf of my client, ${input.senderName}, residing at ${input.senderAddress}, I hereby serve upon you the following legal notice:

FACTS:

1. ${input.facts}

LEGAL POSITION:

2. The above facts and circumstances attract the provisions of:
${config.sections.map((s, i) => `   (${String.fromCharCode(97 + i)}) ${s}`).join("\n")}

3. Under the said provisions of law, you are legally bound to comply with the demand stated herein within the stipulated time frame.

DEMAND:

4. You are hereby called upon to ${input.reliefSought} within ${deadline} (${numberToWords(deadline)}) days from the date of receipt of this notice.

CONSEQUENCES OF NON-COMPLIANCE:

5. In the event of your failure to comply with this notice within the aforesaid period of ${deadline} days, my client shall be constrained to:
${config.consequences.map((c, i) => `   (${String.fromCharCode(97 + i)}) ${c}`).join("\n")}

6. In such event, you shall also be liable for all costs, charges, and expenses incurred by my client, including advocate's fees.

7. Please note that this notice is being sent to you via Registered Post with Acknowledgement Due and shall be deemed to have been served upon you on the date of delivery/refusal/return of the postal article.

${config.withoutPrejudice ? "8. This notice is issued without prejudice to any other rights and remedies available to my client under law.\n\n" : ""}Kindly govern yourself accordingly.

${input.senderName}
(Through Advocate / In Person)

Encl: Copy retained for record.

DISPATCH: ${config.dispatchNote}`;

  return notice;
}

function numberToWords(n: number): string {
  const words: Record<number, string> = { 15: "fifteen", 30: "thirty", 60: "sixty" };
  return words[n] || String(n);
}

export function run(input: RunInput): RunResult {
  const disputeType = (input.disputeType ?? "").trim();
  const senderName = (input.senderName ?? "").trim();
  const senderAddress = (input.senderAddress ?? "").trim();
  const recipientName = (input.recipientName ?? "").trim();
  const recipientAddress = (input.recipientAddress ?? "").trim();
  const facts = (input.facts ?? "").trim();
  const reliefSought = (input.reliefSought ?? "").trim();
  const deadlineDaysRaw = (input.deadlineDays ?? "").trim();

  if (!disputeType) throw new Error("Select the nature of dispute to determine which legal sections and timeline apply.");
  if (!senderName) throw new Error("Enter the sender's full legal name as it should appear on the notice.");
  if (!senderAddress) throw new Error("Enter the sender's complete address for the notice header.");
  if (!recipientName) throw new Error("Enter the recipient's full legal name or company name.");
  if (!recipientAddress) throw new Error("Enter the recipient's address where the notice will be dispatched via RPAD.");
  if (!facts) throw new Error("Describe the brief facts of the dispute including relevant dates, amounts, and events.");
  if (!reliefSought) throw new Error("State what relief you seek (payment, vacating property, stopping action, etc.).");

  const config = DISPUTE_CONFIG[disputeType];
  if (!config) throw new Error(`Unsupported dispute type: ${disputeType}. Choose from the available options.`);

  const deadline = deadlineDaysRaw ? Number(deadlineDaysRaw) : config.mandatoryDeadline;
  const mistakes = COMMON_MISTAKES[disputeType] || [];

  // Check for potential issues
  const warnings: string[] = [];
  if (deadline < config.mandatoryDeadline) {
    warnings.push(`WARNING: ${disputeType} requires minimum ${config.mandatoryDeadline} days deadline. Using ${config.mandatoryDeadline} days instead.`);
  }
  const effectiveDeadline = Math.max(deadline, config.mandatoryDeadline);

  if (facts.length < 50) {
    warnings.push("Facts section is very brief. Include specific dates, amounts, document numbers for a stronger notice.");
  }
  if (disputeType === "Cheque bounce" && !facts.toLowerCase().includes("cheque")) {
    warnings.push("Cheque bounce notice should mention cheque number, date, bank name, and return memo date.");
  }
  if (disputeType === "Notice to government (Section 80 CPC)") {
    warnings.push("IMPORTANT: You must wait full 60 days after notice delivery before filing suit. Filing earlier makes the suit dismissible.");
  }

  // Generate notice text
  const noticeText = generateNoticeText(input, config, effectiveDeadline);

  // Compute strength indicators
  const hasSpecificAmounts = /rs\.?\s*[\d,]+|inr\s*[\d,]+|\d+[\d,]*\/-/i.test(facts + " " + reliefSought);
  const hasDates = /\d{1,2}[-\/]\w+[-\/]\d{2,4}|\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(facts);
  const hasDocRef = /no\.\s*\w+|invoice|receipt|agreement|deed|cheque|letter/i.test(facts);

  let strength = 40; // base
  if (hasSpecificAmounts) strength += 20;
  if (hasDates) strength += 20;
  if (hasDocRef) strength += 20;
  strength = Math.min(100, strength);

  const strengthBand = strength >= 80 ? "good" : strength >= 60 ? "warn" : "bad";
  const strengthLabel = strength >= 80 ? "Strong notice" : strength >= 60 ? "Adequate but could be stronger" : "Needs more specific details";

  const headline = `Legal notice generated for ${disputeType} dispute. Sections cited: ${config.sections.length}. Response deadline: ${effectiveDeadline} days. Forum: ${config.courtForum.split("/")[0].trim()}. ${strengthLabel}.`;

  return {
    headline,
    score: {
      label: "Notice Strength",
      value: strength,
      max: 100,
      band: strengthBand,
    },
    metrics: [
      { label: "Dispute type", value: disputeType, hint: config.sections[0].split("(")[0].trim() },
      { label: "Response deadline", value: `${effectiveDeadline} days`, hint: `Mandatory minimum: ${config.mandatoryDeadline} days` },
      { label: "Sections cited", value: String(config.sections.length), hint: "Statutory provisions referenced" },
      { label: "Limitation", value: config.limitationPeriod.split(".")[0], hint: "File before this expires" },
    ],
    sections: [
      {
        title: "Legal Sections Applicable",
        items: config.sections.map((s) => ({
          title: s.split(" (")[0],
          body: s.includes("(") ? s.split("(").slice(1).join("(").replace(")", "") : "Applicable provision",
          severity: "low" as Severity,
        })),
      },
      {
        title: "Consequences on Non-Compliance",
        items: config.consequences.map((c) => ({
          title: c,
          body: `Will be initiated after expiry of ${effectiveDeadline}-day notice period.`,
          severity: "medium" as Severity,
        })),
      },
      {
        title: "Pre-requisites / Conditions",
        items: config.preRequisites.map((p) => ({
          title: p,
          body: "Ensure this condition is satisfied before sending.",
          severity: "high" as Severity,
        })),
      },
      ...(warnings.length > 0
        ? [{
            title: "Warnings",
            items: warnings.map((w) => ({
              title: w,
              body: "Address this before dispatching the notice.",
              severity: "high" as Severity,
            })),
          }]
        : []),
      {
        title: "Common Mistakes to Avoid",
        items: mistakes.map((m) => ({
          title: m,
          body: "This error can invalidate the notice or weaken your case.",
          severity: "medium" as Severity,
        })),
      },
      {
        title: "Dispatch Instructions",
        items: [
          {
            title: "Send via Registered Post with Acknowledgement Due (RPAD)",
            body: config.dispatchNote,
            severity: "low" as Severity,
          },
          {
            title: "Retain proof of dispatch",
            body: "Keep the post office receipt, tracking number, and the AD card when returned signed/unsigned. This is evidence of service.",
            severity: "low" as Severity,
          },
          {
            title: "Forum for legal action",
            body: config.courtForum,
            severity: "low" as Severity,
          },
        ],
      },
    ],
    copyBlocks: [
      {
        title: "Legal Notice (Ready to Print)",
        text: noticeText,
        language: "text",
      },
    ],
    json: {
      disputeType,
      sender: { name: senderName, address: senderAddress },
      recipient: { name: recipientName, address: recipientAddress },
      sections: config.sections,
      deadline: effectiveDeadline,
      mandatoryMinimum: config.mandatoryDeadline,
      consequences: config.consequences,
      courtForum: config.courtForum,
      limitationPeriod: config.limitationPeriod,
      withoutPrejudice: config.withoutPrejudice,
      strength,
      warnings,
      mistakes,
    },
  };
}
