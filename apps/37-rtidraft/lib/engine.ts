import type { RunInput, RunResult, Severity } from "./types.ts";

/**
 * RTIDraft engine - Generates a properly formatted RTI application under the
 * Right to Information Act 2005 with correct legal citations, fee structure,
 * PIO addressing, and appeal guidance.
 */

type FeeInfo = {
  amount: string;
  payableTo: string;
  mode: string;
  notes: string;
};

type StateConfig = {
  fee: string;
  mode: string;
  notes: string;
  appealAuthority: string;
  commission: string;
};

const STATE_FEES: Record<string, StateConfig> = {
  "Andhra Pradesh": { fee: "Rs 10", mode: "Court Fee Stamp / DD / Banker's Cheque", notes: "Payable to the accounts officer of the public authority", appealAuthority: "First Appellate Authority of the department", commission: "Andhra Pradesh State Information Commission (APSIC)" },
  "Bihar": { fee: "Rs 10", mode: "Court Fee Stamp / Treasury Challan / DD", notes: "DD payable to the public authority", appealAuthority: "Officer senior to PIO in the department", commission: "Bihar State Information Commission" },
  "Delhi": { fee: "Rs 10", mode: "Court Fee Stamp / DD / IPO / Cash", notes: "DD/IPO payable to the Accounts Officer of the public authority", appealAuthority: "First Appellate Authority designated by the department", commission: "Delhi State Information Commission" },
  "Gujarat": { fee: "Rs 20", mode: "Court Fee Stamp / DD / IPO", notes: "DD payable to the public authority. Note: Gujarat charges Rs 20, higher than most states.", appealAuthority: "First Appellate Authority of the department", commission: "Gujarat State Information Commission" },
  "Haryana": { fee: "Rs 10", mode: "Court Fee Stamp / DD / IPO / Cash", notes: "DD/IPO payable to the public authority", appealAuthority: "First Appellate Authority of the department", commission: "Haryana State Information Commission" },
  "Karnataka": { fee: "Rs 10", mode: "Court Fee Stamp / DD / IPO / Karnataka One portal", notes: "Can be filed online at karnataka.gov.in/rti with online payment", appealAuthority: "First Appellate Authority of the department", commission: "Karnataka State Information Commission" },
  "Kerala": { fee: "Rs 10", mode: "Court Fee Stamp / Treasury Challan / DD", notes: "DD payable to the public authority", appealAuthority: "First Appellate Authority of the department", commission: "Kerala State Information Commission" },
  "Madhya Pradesh": { fee: "Rs 10", mode: "Court Fee Stamp / DD / IPO / Cash", notes: "Cash receipt must be obtained", appealAuthority: "First Appellate Authority of the department", commission: "Madhya Pradesh State Information Commission" },
  "Maharashtra": { fee: "Rs 10", mode: "Court Fee Stamp / DD / IPO / Cash / Online", notes: "Can file online at rtionline.maharashtra.gov.in. DD payable to the PIO's office.", appealAuthority: "First Appellate Authority (officer senior to PIO)", commission: "Maharashtra State Information Commission (MSIC)" },
  "Punjab": { fee: "Rs 10", mode: "Court Fee Stamp / DD / IPO", notes: "DD/IPO payable to the public authority", appealAuthority: "First Appellate Authority of the department", commission: "Punjab State Information Commission" },
  "Rajasthan": { fee: "Rs 10", mode: "Court Fee Stamp / DD / IPO / Cash", notes: "DD payable to the public authority", appealAuthority: "First Appellate Authority of the department", commission: "Rajasthan State Information Commission" },
  "Tamil Nadu": { fee: "Rs 10", mode: "Court Fee Stamp / DD / Money Order", notes: "DD payable to the Accounts Officer of the public authority. Money Order also accepted.", appealAuthority: "First Appellate Authority of the department", commission: "Tamil Nadu State Information Commission" },
  "Telangana": { fee: "Rs 10", mode: "Court Fee Stamp / DD / Banker's Cheque", notes: "DD payable to the public authority", appealAuthority: "First Appellate Authority of the department", commission: "Telangana State Information Commission" },
  "Uttar Pradesh": { fee: "Rs 10", mode: "Treasury Challan / DD / IPO / Cash / Court Fee Stamp", notes: "UP accepts the widest range of payment modes", appealAuthority: "First Appellate Authority of the department", commission: "Uttar Pradesh State Information Commission" },
  "West Bengal": { fee: "Rs 10", mode: "Court Fee Stamp / DD / IPO", notes: "DD payable to the public authority", appealAuthority: "First Appellate Authority of the department", commission: "West Bengal State Information Commission" },
  "Other": { fee: "Rs 10", mode: "Court Fee Stamp / DD / IPO (verify with state rules)", notes: "Fee and mode may vary. Check your state RTI rules for exact details.", appealAuthority: "First Appellate Authority of the department", commission: "State Information Commission of your state" },
};

const CENTRAL_FEE: FeeInfo = {
  amount: "Rs 10",
  payableTo: "Accounts Officer, [Department Name]",
  mode: "Indian Postal Order (IPO) / Demand Draft / Banker's Cheque / Cash (if filing in person)",
  notes: "IPO/DD payable to the Accounts Officer of the public authority. If filing through rtionline.gov.in, pay online via net banking/debit card.",
};

const PSU_FEE: FeeInfo = {
  amount: "Rs 10",
  payableTo: "Accounts Officer of the PSU",
  mode: "DD / Banker's Cheque / IPO",
  notes: "PSUs under central government follow central RTI rules. State PSUs follow respective state rules.",
};

// Opinion/reason phrases that should be reframed as information requests
const OPINION_PHRASES = [
  "why did", "why was", "why is", "why are", "what is the reason",
  "explain why", "justify", "what do you think", "your opinion",
  "what is your view", "do you agree", "is it fair", "is it right",
];

function getFeeInfo(authorityType: string, state: string, department: string): FeeInfo {
  if (authorityType === "Central Government" || authorityType === "PSU") {
    const fee = authorityType === "PSU" ? PSU_FEE : CENTRAL_FEE;
    return { ...fee, payableTo: fee.payableTo.replace("[Department Name]", department) };
  }
  const stateConfig = STATE_FEES[state] || STATE_FEES["Other"];
  return {
    amount: stateConfig.fee,
    payableTo: `Accounts Officer, ${department}`,
    mode: stateConfig.mode,
    notes: stateConfig.notes,
  };
}

function getAppealInfo(authorityType: string, state: string): { firstAppeal: string; secondAppeal: string; commission: string } {
  if (authorityType === "Central Government" || authorityType === "PSU") {
    return {
      firstAppeal: "Officer senior in rank to the CPIO in the same department (First Appellate Authority under Section 19(1))",
      secondAppeal: "Central Information Commission (CIC), New Delhi",
      commission: "Central Information Commission (CIC), August Kranti Bhawan, Bhikaji Cama Place, New Delhi - 110066",
    };
  }
  const stateConfig = STATE_FEES[state] || STATE_FEES["Other"];
  return {
    firstAppeal: stateConfig.appealAuthority,
    secondAppeal: stateConfig.commission,
    commission: stateConfig.commission,
  };
}

function detectIssues(information: string): { title: string; body: string; severity: Severity }[] {
  const issues: { title: string; body: string; severity: Severity }[] = [];
  const lower = information.toLowerCase();

  // Check for opinion-seeking language
  const opinionMatches = OPINION_PHRASES.filter((p) => lower.includes(p));
  if (opinionMatches.length > 0) {
    issues.push({
      title: "Asking for opinions instead of information",
      body: `Your request contains: "${opinionMatches[0]}". Under Section 2(f), RTI only covers recorded information (documents, files, memos, data). Reframe as: "Provide copies of file notings/records/documents regarding..." instead of asking why or for justification.`,
      severity: "high",
    });
  }

  // Check for missing time period
  const hasDateRef = /\d{4}|january|february|march|april|may|june|july|august|september|october|november|december|last\s+(year|month|quarter)|financial\s+year|fy\s*\d/i.test(information);
  if (!hasDateRef) {
    issues.push({
      title: "No time period specified",
      body: "Always specify the date range for the information you seek (e.g., 'during the period April 2022 to March 2023' or 'for financial year 2023-24'). Without a time period, the PIO can claim the request is too broad and reject it under Section 7(9).",
      severity: "medium",
    });
  }

  // Check for overly broad requests
  if (lower.includes("all information") || lower.includes("everything about") || lower.includes("all records")) {
    if (!hasDateRef) {
      issues.push({
        title: "Request may be too broad",
        body: "Asking for 'all information' without a specific time period or document type may be rejected as unreasonably diverting resources (Section 7(9)). Narrow it: specify document types (file notings, correspondence, reports, contracts) and time period.",
        severity: "medium",
      });
    }
  }

  // Check if asking for third-party personal information
  if (/salary|income|personal.*details|medical|health.*record|private/i.test(lower)) {
    issues.push({
      title: "Possible third-party personal information",
      body: "Information relating to personal details of third parties may be denied under Section 8(1)(j) unless you can demonstrate that the public interest in disclosure outweighs the privacy interest. Government officials' salaries paid from public funds are generally disclosable.",
      severity: "low",
    });
  }

  return issues;
}

function formatDate(): string {
  const d = new Date();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function structureQuestions(information: string): string[] {
  // Split by sentences or numbered items
  const sentences = information
    .split(/[.;]\s+|\n+|\d+\)\s*|\d+\.\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  if (sentences.length <= 1) {
    // Single block - format as one detailed question
    return [information.trim()];
  }
  return sentences;
}

export function run(input: RunInput): RunResult {
  const authorityType = (input.authorityType ?? "").trim();
  const state = (input.state ?? "").trim();
  const department = (input.department ?? "").trim();
  const information = (input.information ?? "").trim();
  const applicantName = (input.applicantName ?? "").trim();
  const applicantAddress = (input.applicantAddress ?? "").trim();
  const isBPL = (input.isBPL ?? "No").trim() === "Yes";

  if (!authorityType) throw new Error("Select the type of authority (Central Government, State Government, PSU, or Municipality) to determine the correct PIO addressing and fee structure.");
  if (!department) throw new Error("Enter the department or authority name (e.g., Ministry of Railways, BMC Water Department, BSNL). This is needed to address the application correctly.");
  if (!information) throw new Error("Describe what information you want. Be specific: mention documents, time periods, and file numbers if known. Ask for records, not opinions.");
  if (information.length < 30) throw new Error("Your information request is too brief. Be specific about what documents, records, or data you want, and for which time period.");
  if (!applicantName) throw new Error("Enter your full name as it appears on your ID. This is required for the application.");
  if (!applicantAddress) throw new Error("Enter your full address including PIN code. The reply will be sent to this address.");

  if (authorityType === "State Government" || authorityType === "Municipality/Local Body") {
    if (!state || state === "Not applicable (Central)") {
      throw new Error("Select your state for state government or local body RTI. Fee structure and appeal authority vary by state.");
    }
  }

  const feeInfo = getFeeInfo(authorityType, state, department);
  const appealInfo = getAppealInfo(authorityType, state);
  const issues = detectIssues(information);
  const questions = structureQuestions(information);
  const today = formatDate();

  // Determine PIO title
  const pioTitle = authorityType === "Central Government"
    ? "Central Public Information Officer (CPIO)"
    : authorityType === "PSU"
      ? "Central Public Information Officer (CPIO) / Transparency Officer"
      : "Public Information Officer (PIO)";

  // Build the application text
  const questionsFormatted = questions.length === 1
    ? questions[0]
    : questions.map((q, i) => `${i + 1}. ${q}`).join("\n");

  const feeSection = isBPL
    ? "I am a Below Poverty Line (BPL) cardholder and hence exempt from paying the application fee under Section 7(5) of the RTI Act, 2005. A copy of my BPL certificate is enclosed."
    : `I am enclosing ${feeInfo.amount} via ${feeInfo.mode.split("/")[0].trim()} as the prescribed fee under the RTI Act, 2005.\n\nFee Details:\n- Amount: ${feeInfo.amount}\n- Mode: ${feeInfo.mode}\n- Payable to: ${feeInfo.payableTo}`;

  const applicationText = `APPLICATION UNDER THE RIGHT TO INFORMATION ACT, 2005

Date: ${today}

To,
The ${pioTitle},
${department},
[Office Address of the PIO]

Subject: Application for information under Section 6(1) of the Right to Information Act, 2005

Respected Sir/Madam,

I, ${applicantName}, am an Indian citizen. Under Section 6(1) of the Right to Information Act, 2005, I request the following information:

${questionsFormatted}

I request that the above information be provided in the form of certified copies/photocopies of relevant documents and records. If the information is available in electronic form, it may be provided on CD/email.

${feeSection}

If this application or any part of it does not pertain to your office, I request that it be transferred to the concerned Public Information Officer under Section 6(3) of the RTI Act within the stipulated period of 5 days.

I would like to receive the information in English/Hindi [strike out whichever is not applicable].

Applicant Details:
Name: ${applicantName}
Address: ${applicantAddress}

Yours faithfully,
${applicantName}

Date: ${today}
Place: ${applicantAddress.split(",").pop()?.trim() || "[Your City]"}

Enclosures:
1. ${isBPL ? "Copy of BPL certificate" : `${feeInfo.mode.split("/")[0].trim()} of ${feeInfo.amount}`}
2. Copy of ID proof (optional but recommended)`;

  // Appeal guidance text
  const appealText = `APPEAL PROCESS (if no reply within 30 days):

FIRST APPEAL (Section 19(1)):
- File within 30 days of the 30-day response deadline
- Address to: ${appealInfo.firstAppeal}
- No additional fee for first appeal
- The appellate authority must decide within 30 days (extendable to 45)

SECOND APPEAL (Section 19(3)):
- If first appeal is rejected or not decided within 30/45 days
- File within 90 days with: ${appealInfo.commission}
- CIC/SIC can impose penalty of Rs 250/day (max Rs 25,000) on the PIO under Section 20

IMPORTANT TIMELINES:
- PIO must respond: 30 days from receipt (48 hours for life/liberty matters)
- Transfer to correct PIO: 5 days (Section 6(3))
- First appeal deadline: 30 days after response due date
- Second appeal deadline: 90 days after first appeal decision`;

  // Score: how likely this application is to get a proper response
  let successScore = 70; // base score for a well-formatted application
  if (issues.some((i) => i.severity === "high")) successScore -= 25;
  if (issues.some((i) => i.severity === "medium")) successScore -= 10;
  if (questions.length > 1) successScore += 5; // well-structured
  if (information.length > 100) successScore += 5; // detailed
  const hasDateRef = /\d{4}|january|february|march|april|may|june|july|august|september|october|november|december|financial\s+year/i.test(information);
  if (hasDateRef) successScore += 10;
  successScore = Math.min(95, Math.max(20, successScore));

  const band = successScore >= 70 ? "good" : successScore >= 50 ? "warn" : "bad";

  const headline = `RTI application generated for ${department} (${authorityType}). Fee: ${isBPL ? "Exempt (BPL)" : feeInfo.amount}. Response deadline: 30 days. ${issues.length === 0 ? "No issues detected." : `${issues.length} potential issue(s) flagged.`}`;

  return {
    headline,
    score: {
      label: "Application Strength",
      value: successScore,
      max: 100,
      band,
    },
    metrics: [
      { label: "Fee required", value: isBPL ? "Exempt" : feeInfo.amount, hint: isBPL ? "BPL exemption" : feeInfo.mode.split("/")[0].trim() },
      { label: "Response deadline", value: "30 days", hint: "From date of receipt" },
      { label: "Questions framed", value: String(questions.length), hint: "Numbered and specific" },
      { label: "Issues found", value: String(issues.length), hint: issues.length === 0 ? "Ready to send" : "Review before sending" },
    ],
    sections: [
      ...(issues.length > 0 ? [{
        title: "Issues to Fix Before Sending",
        items: issues,
      }] : []),
      {
        title: "Fee Payment Details",
        items: [
          {
            title: `${isBPL ? "Fee exempt (BPL)" : feeInfo.amount + " via " + feeInfo.mode}`,
            body: isBPL
              ? "As a BPL cardholder, you are exempt from application fee under Section 7(5). Attach a copy of your BPL certificate with the application."
              : `${feeInfo.notes}\n\nAdditional fees for information: Rs 2 per page (A4/A3 photocopy), actual cost for larger documents, samples, or inspection. First 20 pages free for BPL applicants.`,
            severity: "low" as Severity,
          },
        ],
      },
      {
        title: "Where to Send",
        items: [
          {
            title: `${pioTitle}, ${department}`,
            body: authorityType === "Central Government"
              ? `For central government departments, you can also file online at rtionline.gov.in with online payment. For postal filing, address to the CPIO of ${department} at their head office or the regional office that holds the information.`
              : `Address to the ${pioTitle} of ${department}. If you are unsure of the specific PIO, address to the head of the department - they are obligated to transfer it to the correct PIO within 5 days under Section 6(3).`,
            severity: "low" as Severity,
          },
        ],
      },
      {
        title: "Appeal Process (if no response in 30 days)",
        items: [
          {
            title: "First Appeal - Section 19(1)",
            body: `File within 30 days of the response deadline expiry. Address to: ${appealInfo.firstAppeal}. No fee required for first appeal. They must decide within 30 days (extendable to 45).`,
            severity: "low" as Severity,
          },
          {
            title: "Second Appeal - Section 19(3)",
            body: `If first appeal fails, file with ${appealInfo.commission} within 90 days. The Commission can impose penalty of Rs 250/day (max Rs 25,000) on the PIO for non-compliance.`,
            severity: "low" as Severity,
          },
        ],
      },
      {
        title: "Tips for Better Response",
        items: [
          {
            title: "Send by Speed Post with tracking",
            body: "Always send by Speed Post (not ordinary post). Keep the tracking receipt as proof of date of receipt. The 30-day clock starts from the date the PIO receives it.",
            severity: "low" as Severity,
          },
          {
            title: "Keep a copy of everything",
            body: "Photocopy the application, fee receipt, and postal receipt before sending. You will need these for the first appeal if the deadline passes without a response.",
            severity: "low" as Severity,
          },
          {
            title: "One application per topic",
            body: "If you want information from multiple departments, file separate applications. A single application addressing multiple PIOs will be rejected or delayed.",
            severity: "low" as Severity,
          },
        ],
      },
    ],
    copyBlocks: [
      {
        title: "RTI Application (ready to print and send)",
        text: applicationText,
        language: "text",
      },
      {
        title: "Appeal Process Reference",
        text: appealText,
        language: "text",
      },
    ],
    json: {
      application: {
        date: today,
        authority: { type: authorityType, state: state || null, department },
        pio: pioTitle,
        applicant: { name: applicantName, address: applicantAddress, bpl: isBPL },
        questions,
        fee: isBPL ? { exempt: true, reason: "BPL" } : { amount: feeInfo.amount, mode: feeInfo.mode, payableTo: feeInfo.payableTo },
      },
      appeal: appealInfo,
      issues: issues.map((i) => ({ title: i.title, severity: i.severity })),
      successScore,
      timelines: {
        responseDeadline: "30 days from receipt",
        transferDeadline: "5 days (Section 6(3))",
        firstAppealDeadline: "30 days after response due date",
        secondAppealDeadline: "90 days after first appeal decision",
        lifeAndLiberty: "48 hours",
      },
      legalReferences: {
        applicationSection: "Section 6(1)",
        feeSection: "Section 7(1)",
        bplExemption: "Section 7(5)",
        transferObligation: "Section 6(3)",
        responseTimeline: "Section 7(1)",
        firstAppeal: "Section 19(1)",
        secondAppeal: "Section 19(3)",
        penalty: "Section 20",
        exemptions: "Section 8",
      },
    },
  };
}
