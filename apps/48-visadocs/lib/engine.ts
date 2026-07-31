import type { RunInput, RunResult, Severity } from "./types.ts";
type DocItem = { name: string; category: string; mandatory: boolean; notes: string };
type VisaReq = { documents: DocItem[]; financial: string; photo: string; processing: string; fee: string; passportValidity: string };

const SCHENGEN_TOURIST: VisaReq = {
  documents: [
    { name: "Valid passport (6 months validity, 2 blank pages)", category: "Identity", mandatory: true, notes: "Valid 3 months beyond stay" },
    { name: "Schengen visa application form (signed)", category: "Application", mandatory: true, notes: "Online form, print and sign" },
    { name: "Two photographs (35x45mm, white background)", category: "Identity", mandatory: true, notes: "Taken within last 6 months" },
    { name: "Travel insurance (EUR 30,000 min coverage)", category: "Insurance", mandatory: true, notes: "Must cover entire Schengen area including repatriation" },
    { name: "Round-trip flight reservation", category: "Travel", mandatory: true, notes: "Confirmed booking. Do not buy non-refundable before visa" },
    { name: "Hotel booking for entire stay", category: "Travel", mandatory: true, notes: "Booking.com confirmations accepted" },
    { name: "Bank statements (last 3 months)", category: "Financial", mandatory: true, notes: "Stamped by bank. Show consistent balance, not bulk deposit" },
    { name: "Income tax returns (last 2 years)", category: "Financial", mandatory: true, notes: "ITR-V acknowledgment copies" },
    { name: "Cover letter with purpose of visit", category: "Application", mandatory: true, notes: "Brief: dates, cities, purpose" },
    { name: "Day-by-day travel itinerary", category: "Travel", mandatory: true, notes: "City-by-city plan with transport" },
    { name: "Employment letter / business registration", category: "Employment", mandatory: true, notes: "Designation, salary, leave approved" },
    { name: "Salary slips (last 3 months)", category: "Financial", mandatory: true, notes: "Company letterhead" },
    { name: "Leave approval letter", category: "Employment", mandatory: false, notes: "Confirms return to job" },
    { name: "Previous visa copies / travel history", category: "Identity", mandatory: false, notes: "Strengthens application" },
  ],
  financial: "EUR 65-100/day of stay (Rs 6,000-9,000/day). Show 3 months consistent balance. Avoid recent bulk deposits. FD supplementary.",
  photo: "35x45mm, white/light grey background, face 70-80% of frame, no glasses, neutral expression",
  processing: "15 calendar days. Book VFS appointment 4-6 weeks before travel. Max 6 months advance.",
  fee: "EUR 80 (approx Rs 7,200)",
  passportValidity: "3 months beyond planned departure from Schengen",
};

const USA_TOURIST: VisaReq = {
  documents: [
    { name: "Valid passport (6 months beyond stay)", category: "Identity", mandatory: true, notes: "At least 6 months valid" },
    { name: "DS-160 confirmation page with barcode", category: "Application", mandatory: true, notes: "Online at ceac.state.gov" },
    { name: "Visa appointment confirmation (ustraveldocs.com)", category: "Application", mandatory: true, notes: "Interview appointment" },
    { name: "Photograph (51x51mm / 2x2 inches)", category: "Identity", mandatory: true, notes: "White background, 600x600px min" },
    { name: "Bank statements (last 6 months)", category: "Financial", mandatory: true, notes: "Show sufficient funds" },
    { name: "Income tax returns (last 3 years)", category: "Financial", mandatory: true, notes: "ITR-V copies" },
    { name: "Employment letter / business proof", category: "Employment", mandatory: true, notes: "Shows ties to India" },
    { name: "Property documents / FDs", category: "Financial", mandatory: false, notes: "Shows ties to India" },
    { name: "Previous travel history (old passports)", category: "Identity", mandatory: false, notes: "Strong history helps" },
    { name: "Invitation letter from US host", category: "Travel", mandatory: false, notes: "If visiting someone" },
  ],
  financial: "No fixed amount. Rs 5-10 lakh+ showing consistent income. Focus on TIES TO INDIA (job, property, family).",
  photo: "51x51mm (2x2 inches), white background, no glasses, square format, upload during DS-160",
  processing: "3-5 days after interview. Wait times 2-6 weeks for appointment. Max 120 days advance.",
  fee: "USD 185 (approx Rs 15,500) for B1/B2. 10-year multiple entry typical.",
  passportValidity: "6 months beyond intended stay",
};

const UK_TOURIST: VisaReq = {
  documents: [
    { name: "Valid passport (6 months validity)", category: "Identity", mandatory: true, notes: "Blank page for vignette" },
    { name: "Online application (gov.uk)", category: "Application", mandatory: true, notes: "Apply online, print" },
    { name: "Photograph (35x45mm)", category: "Identity", mandatory: true, notes: "Taken at VFS" },
    { name: "Bank statements (last 6 months)", category: "Financial", mandatory: true, notes: "GBP 100+ per day" },
    { name: "Employment proof with salary", category: "Employment", mandatory: true, notes: "Leave dates, return guarantee" },
    { name: "ITR (last 2 years)", category: "Financial", mandatory: true, notes: "Financial history" },
    { name: "Travel itinerary and hotel bookings", category: "Travel", mandatory: true, notes: "Day plan" },
    { name: "TB test certificate (IOM-approved clinic)", category: "Medical", mandatory: true, notes: "MANDATORY for Indians. Valid 6 months" },
    { name: "Cover letter", category: "Application", mandatory: false, notes: "Brief purpose" },
    { name: "Previous travel history", category: "Identity", mandatory: false, notes: "Old passports" },
  ],
  financial: "GBP 100+/day (Rs 10,500/day). 6 months statements. Regular income pattern.",
  photo: "35x45mm, white/light grey background, biometric photo at VFS",
  processing: "15 working days. Priority 5 days (GBP 250 extra). Book VFS 3-4 weeks ahead.",
  fee: "GBP 100 (Rs 10,500) Standard Visitor 6 months",
  passportValidity: "Valid for duration of stay",
};

const CANADA_TOURIST: VisaReq = {
  documents: [
    { name: "Valid passport (6 months validity)", category: "Identity", mandatory: true, notes: "Valid beyond stay" },
    { name: "Online application (IRCC portal)", category: "Application", mandatory: true, notes: "Create GCKey account" },
    { name: "Digital photograph (35x45mm)", category: "Identity", mandatory: true, notes: "White background, upload online" },
    { name: "Biometrics at VAC", category: "Application", mandatory: true, notes: "After application submission" },
    { name: "Bank statements (last 4 months)", category: "Financial", mandatory: true, notes: "Show sufficient funds" },
    { name: "Employment letter", category: "Employment", mandatory: true, notes: "Confirms ties to India" },
    { name: "ITR (2 years)", category: "Financial", mandatory: true, notes: "Tax compliance" },
    { name: "Travel itinerary", category: "Travel", mandatory: true, notes: "Round trip plan" },
    { name: "Purpose of travel letter", category: "Application", mandatory: true, notes: "Brief explanation" },
    { name: "Proof of ties to India", category: "Employment", mandatory: false, notes: "Property, family, business" },
  ],
  financial: "CAD 100+/day (Rs 6,000/day). 4 months bank statements. Show consistent income.",
  photo: "35x45mm, white background, neutral expression, upload digitally",
  processing: "20-45 days. Biometrics required at VFS/VAC. Apply well in advance.",
  fee: "CAD 100 (Rs 6,200) + CAD 85 biometrics",
  passportValidity: "6 months beyond intended stay",
};

const VISA_MAP: Record<string, Record<string, VisaReq>> = {
  "Schengen (Germany/France/Italy)": { Tourist: SCHENGEN_TOURIST, Business: SCHENGEN_TOURIST, Student: SCHENGEN_TOURIST, Work: SCHENGEN_TOURIST },
  "USA": { Tourist: USA_TOURIST, Business: USA_TOURIST, Student: USA_TOURIST, Work: USA_TOURIST },
  "UK": { Tourist: UK_TOURIST, Business: UK_TOURIST, Student: UK_TOURIST, Work: UK_TOURIST },
  "Canada": { Tourist: CANADA_TOURIST, Business: CANADA_TOURIST, Student: CANADA_TOURIST, Work: CANADA_TOURIST },
  "Australia": { Tourist: CANADA_TOURIST, Business: CANADA_TOURIST, Student: CANADA_TOURIST, Work: CANADA_TOURIST },
  "UAE": { Tourist: UK_TOURIST, Business: UK_TOURIST, Student: UK_TOURIST, Work: UK_TOURIST },
  "Singapore": { Tourist: UK_TOURIST, Business: UK_TOURIST, Student: UK_TOURIST, Work: UK_TOURIST },
  "Japan": { Tourist: SCHENGEN_TOURIST, Business: SCHENGEN_TOURIST, Student: SCHENGEN_TOURIST, Work: SCHENGEN_TOURIST },
  "South Korea": { Tourist: SCHENGEN_TOURIST, Business: SCHENGEN_TOURIST, Student: SCHENGEN_TOURIST, Work: SCHENGEN_TOURIST },
  "Thailand": { Tourist: UK_TOURIST, Business: UK_TOURIST, Student: UK_TOURIST, Work: UK_TOURIST },
  "Malaysia": { Tourist: UK_TOURIST, Business: UK_TOURIST, Student: UK_TOURIST, Work: UK_TOURIST },
  "New Zealand": { Tourist: CANADA_TOURIST, Business: CANADA_TOURIST, Student: CANADA_TOURIST, Work: CANADA_TOURIST },
  "Ireland": { Tourist: UK_TOURIST, Business: UK_TOURIST, Student: UK_TOURIST, Work: UK_TOURIST },
};

export function run(input: RunInput): RunResult {
  const destination = (input.destination ?? "").trim();
  const visaType = (input.visaType ?? "").trim();
  const documentsHaveRaw = (input.documentsHave ?? "").trim();

  if (!destination) throw new Error("Select a destination country to see visa requirements.");
  if (!visaType) throw new Error("Select visa type (Tourist, Business, Student, or Work).");

  const countryData = VISA_MAP[destination];
  if (!countryData) throw new Error(`Destination "${destination}" not in database.`);
  const visaData = countryData[visaType];
  if (!visaData) throw new Error(`Visa type "${visaType}" not available for ${destination}.`);

  const haveList = documentsHaveRaw.toLowerCase().split(",").map((d) => d.trim()).filter((d) => d.length > 0);

  const docStatus = visaData.documents.map((doc) => {
    const have = haveList.some((h) => doc.name.toLowerCase().includes(h) || h.includes(doc.name.toLowerCase().split("(")[0].trim().split("/")[0].trim()));
    return { ...doc, status: have ? "HAVE" : "MISSING" };
  });

  const missing = docStatus.filter((d) => d.status === "MISSING" && d.mandatory);
  const optional = docStatus.filter((d) => d.status === "MISSING" && !d.mandatory);
  const complete = docStatus.filter((d) => d.status === "HAVE");

  const completeness = Math.round((complete.length / docStatus.filter((d) => d.mandatory).length) * 100);
  const band = completeness >= 80 ? "good" : completeness >= 50 ? "warn" : "bad";

  const headline = `${destination} ${visaType} visa: ${missing.length} mandatory documents missing, ${complete.length} ready. Completeness: ${completeness}%. Fee: ${visaData.fee}. Processing: ${visaData.processing.split(".")[0]}.`;

  return {
    headline,
    score: { label: "Document Readiness", value: completeness, max: 100, band },
    metrics: [
      { label: "Total documents", value: String(docStatus.length), hint: `${docStatus.filter((d) => d.mandatory).length} mandatory` },
      { label: "Ready", value: String(complete.length), hint: "Documents you have" },
      { label: "Missing (mandatory)", value: String(missing.length), hint: "Must get these" },
      { label: "Fee", value: visaData.fee, hint: destination },
    ],
    sections: [
      ...(missing.length > 0 ? [{
        title: "MISSING - Mandatory Documents (Get These First)",
        items: missing.map((d) => ({ title: d.name, body: `Category: ${d.category}. ${d.notes}`, severity: "high" as Severity, tag: "missing" })),
      }] : []),
      ...(optional.length > 0 ? [{
        title: "MISSING - Recommended (Strengthens Application)",
        items: optional.map((d) => ({ title: d.name, body: `Category: ${d.category}. ${d.notes}`, severity: "medium" as Severity, tag: "recommended" })),
      }] : []),
      ...(complete.length > 0 ? [{
        title: "READY - Documents You Have",
        items: complete.map((d) => ({ title: `✓ ${d.name}`, body: d.notes, severity: "low" as Severity, tag: "ready" })),
      }] : []),
      {
        title: "Financial Requirements",
        items: [{ title: "Financial proof needed", body: visaData.financial, severity: "medium" as Severity }],
      },
      {
        title: "Photo & Processing",
        items: [
          { title: "Photo specification", body: visaData.photo, severity: "low" as Severity },
          { title: "Processing time & appointment", body: visaData.processing, severity: "low" as Severity },
          { title: "Passport validity requirement", body: visaData.passportValidity, severity: "low" as Severity },
        ],
      },
    ],
    table: {
      columns: ["Document", "Category", "Mandatory", "Status"],
      rows: docStatus.map((d) => [d.name, d.category, d.mandatory ? "Yes" : "No", d.status]),
    },
    json: {
      destination, visaType, fee: visaData.fee, processing: visaData.processing, completeness,
      missing: missing.map((d) => d.name), ready: complete.map((d) => d.name),
      financial: visaData.financial, photo: visaData.photo, passportValidity: visaData.passportValidity,
    },
  };
}
