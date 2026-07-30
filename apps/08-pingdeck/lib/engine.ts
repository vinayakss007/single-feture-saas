import tls from "node:tls";
import type { ResultItem, RunInput, RunResult, Severity } from "./types.ts";

/**
 * PingDeck engine — three independent failure classes, checked for real.
 *
 * The HTTP check is a real request measured from this server. The TLS check is a
 * real handshake reading the peer certificate. The domain check queries the
 * registry over RDAP. Nothing here is inferred from a third party's cache.
 */

const MAX_URLS = 10;
const HTTP_TIMEOUT_MS = 9000;
const TLS_TIMEOUT_MS = 7000;
const RDAP_TIMEOUT_MS = 7000;
const UA = "PingDeck/1.0 (+https://pingdeck.abetworks.in; uptime checker)";

type HttpResult = {
  ok: boolean;
  status: number | null;
  ms: number;
  finalUrl: string;
  redirects: string[];
  bytes: number | null;
  server: string | null;
  error: string | null;
};

type CertResult = {
  available: boolean;
  issuer: string | null;
  subject: string | null;
  validFrom: string | null;
  validTo: string | null;
  daysRemaining: number | null;
  hostnameMatches: boolean | null;
  error: string | null;
};

type DomainResult = {
  available: boolean;
  apex: string | null;
  registrar: string | null;
  expiryDate: string | null;
  daysRemaining: number | null;
  error: string | null;
};

type Monitor = {
  input: string;
  url: URL;
  http: HttpResult;
  cert: CertResult;
  domain: DomainResult;
  state: "up" | "degraded" | "down";
  problems: { title: string; detail: string; severity: Severity }[];
};

function normaliseUrl(raw: string): URL {
  const trimmed = raw.trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withScheme);
  if (!/^https?:$/.test(url.protocol)) throw new Error(`Only http and https can be checked: ${raw}`);
  if (
    /^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|169\.254\.)/.test(url.hostname) ||
    url.hostname.endsWith(".local")
  ) {
    throw new Error(`Private and loopback addresses cannot be checked: ${url.hostname}`);
  }
  return url;
}

/** Follows redirects manually so the whole chain can be reported. */
async function checkHttp(url: URL): Promise<HttpResult> {
  const redirects: string[] = [];
  let current = url.toString();
  const started = Date.now();

  for (let hop = 0; hop < 6; hop += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);
    try {
      const res = await fetch(current, {
        redirect: "manual",
        signal: controller.signal,
        headers: { "User-Agent": UA, Accept: "*/*" },
      });

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (!location) {
          return {
            ok: false,
            status: res.status,
            ms: Date.now() - started,
            finalUrl: current,
            redirects,
            bytes: null,
            server: res.headers.get("server"),
            error: `HTTP ${res.status} with no Location header`,
          };
        }
        const next = new URL(location, current).toString();
        redirects.push(`${res.status} → ${next}`);
        current = next;
        continue;
      }

      const body = await res.arrayBuffer();
      return {
        ok: res.status < 400,
        status: res.status,
        ms: Date.now() - started,
        finalUrl: current,
        redirects,
        bytes: body.byteLength,
        server: res.headers.get("server"),
        error: null,
      };
    } catch (err) {
      const aborted = err instanceof Error && err.name === "AbortError";
      return {
        ok: false,
        status: null,
        ms: Date.now() - started,
        finalUrl: current,
        redirects,
        bytes: null,
        server: null,
        error: aborted ? `No response within ${HTTP_TIMEOUT_MS / 1000}s` : err instanceof Error ? err.message : "Request failed",
      };
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    ok: false,
    status: null,
    ms: Date.now() - started,
    finalUrl: current,
    redirects,
    bytes: null,
    server: null,
    error: "Too many redirects (more than 6 hops)",
  };
}

/** Real TLS handshake — the certificate is read off the wire. */
function checkCert(hostname: string, port = 443): Promise<CertResult> {
  return new Promise((resolve) => {
    const empty: CertResult = {
      available: false,
      issuer: null,
      subject: null,
      validFrom: null,
      validTo: null,
      daysRemaining: null,
      hostnameMatches: null,
      error: null,
    };

    let settled = false;
    const done = (r: CertResult) => {
      if (settled) return;
      settled = true;
      try {
        socket.destroy();
      } catch {
        /* already closed */
      }
      resolve(r);
    };

    const socket = tls.connect(
      { host: hostname, port, servername: hostname, rejectUnauthorized: false, timeout: TLS_TIMEOUT_MS },
      () => {
        const cert = socket.getPeerCertificate();
        if (!cert || Object.keys(cert).length === 0) {
          done({ ...empty, error: "No certificate presented" });
          return;
        }
        const validTo = cert.valid_to ? new Date(cert.valid_to) : null;
        const daysRemaining =
          validTo && !Number.isNaN(validTo.getTime())
            ? Math.floor((validTo.getTime() - Date.now()) / 86_400_000)
            : null;

        // Node types these DN fields as string | string[] because a DN may
        // legally repeat an attribute. Take the first value.
        const one = (v: string | string[] | undefined): string | null =>
          Array.isArray(v) ? (v[0] ?? null) : (v ?? null);

        const names = [
          one(cert.subject?.CN),
          ...(cert.subjectaltname ?? "")
            .split(",")
            .map((s) => s.trim().replace(/^DNS:/i, ""))
            .filter(Boolean),
        ].filter(Boolean) as string[];

        const matches = names.some((n) =>
          n.startsWith("*.")
            ? hostname.endsWith(n.slice(1)) && hostname.split(".").length === n.split(".").length
            : n.toLowerCase() === hostname.toLowerCase(),
        );

        done({
          available: true,
          issuer: one(cert.issuer?.O) ?? one(cert.issuer?.CN),
          subject: one(cert.subject?.CN),
          validFrom: cert.valid_from ?? null,
          validTo: cert.valid_to ?? null,
          daysRemaining,
          hostnameMatches: matches,
          error: null,
        });
      },
    );

    socket.on("timeout", () => done({ ...empty, error: `TLS handshake timed out after ${TLS_TIMEOUT_MS / 1000}s` }));
    socket.on("error", (err: Error) => done({ ...empty, error: err.message }));
  });
}

function apexOf(hostname: string): string {
  const parts = hostname.split(".").filter(Boolean);
  if (parts.length <= 2) return hostname;
  // Handle common two-label public suffixes such as co.in, co.uk, com.au.
  const twoLabelSuffix = /^(co|com|net|org|gov|ac|edu|nic|res|firm|gen|ind)\.[a-z]{2}$/i;
  const lastTwo = parts.slice(-2).join(".");
  return twoLabelSuffix.test(lastTwo) ? parts.slice(-3).join(".") : lastTwo;
}

/** Registry lookup over RDAP. Reported as unavailable rather than guessed. */
async function checkDomain(hostname: string): Promise<DomainResult> {
  const apex = apexOf(hostname);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RDAP_TIMEOUT_MS);
  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(apex)}`, {
      signal: controller.signal,
      redirect: "follow",
      headers: { Accept: "application/rdap+json, application/json", "User-Agent": UA },
    });
    if (!res.ok) {
      return { available: false, apex, registrar: null, expiryDate: null, daysRemaining: null, error: `RDAP responded HTTP ${res.status}` };
    }
    const data = (await res.json()) as {
      events?: { eventAction?: string; eventDate?: string }[];
      entities?: { roles?: string[]; vcardArray?: unknown[] }[];
    };

    const expiryEvent = data.events?.find((e) => /expiration/i.test(e.eventAction ?? ""));
    const expiryDate = expiryEvent?.eventDate ?? null;
    const parsed = expiryDate ? new Date(expiryDate) : null;
    const daysRemaining =
      parsed && !Number.isNaN(parsed.getTime()) ? Math.floor((parsed.getTime() - Date.now()) / 86_400_000) : null;

    const registrarEntity = data.entities?.find((e) => e.roles?.includes("registrar"));
    let registrar: string | null = null;
    const vcard = registrarEntity?.vcardArray?.[1];
    if (Array.isArray(vcard)) {
      const fn = (vcard as unknown[][]).find((f) => Array.isArray(f) && f[0] === "fn");
      if (fn && typeof fn[3] === "string") registrar = fn[3];
    }

    return {
      available: expiryDate !== null,
      apex,
      registrar,
      expiryDate,
      daysRemaining,
      error: expiryDate === null ? "Registry did not publish an expiration event" : null,
    };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return {
      available: false,
      apex,
      registrar: null,
      expiryDate: null,
      daysRemaining: null,
      error: aborted ? "RDAP lookup timed out" : err instanceof Error ? err.message : "RDAP lookup failed",
    };
  } finally {
    clearTimeout(timer);
  }
}

function statusPageHtml(serviceName: string, monitors: Monitor[], overall: number): string {
  const rows = monitors
    .map((m) => {
      const colour = m.state === "up" ? "#12b76a" : m.state === "degraded" ? "#f79009" : "#f04438";
      const label = m.state === "up" ? "Operational" : m.state === "degraded" ? "Degraded" : "Down";
      return `      <li class="row">
        <span class="dot" style="background:${colour}"></span>
        <span class="name">${m.url.hostname}${m.url.pathname === "/" ? "" : m.url.pathname}</span>
        <span class="meta">${m.http.status ?? "—"} · ${m.http.ms} ms</span>
        <span class="state" style="color:${colour}">${label}</span>
      </li>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${serviceName} — Status</title>
<style>
  :root{--ink:#0b1020;--muted:#5b6478;--line:#e6e8f0}
  *{box-sizing:border-box}
  body{margin:0;font:16px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--ink);background:#fff}
  .wrap{max-width:720px;margin:0 auto;padding:56px 20px}
  h1{font-size:28px;letter-spacing:-.02em;margin:0 0 6px}
  .sub{color:var(--muted);margin:0 0 28px;font-size:14px}
  .card{border:1px solid var(--line);border-radius:14px;overflow:hidden}
  ul{list-style:none;margin:0;padding:0}
  .row{display:grid;grid-template-columns:12px 1fr auto auto;gap:12px;align-items:center;padding:16px 20px;border-bottom:1px solid var(--line)}
  .row:last-child{border-bottom:0}
  .dot{width:10px;height:10px;border-radius:99px}
  .name{font-weight:600;font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .meta{color:var(--muted);font-size:13px;font-variant-numeric:tabular-nums}
  .state{font-size:13px;font-weight:600}
  footer{margin-top:24px;color:var(--muted);font-size:13px}
</style>
</head>
<body>
  <div class="wrap">
    <h1>${serviceName} status</h1>
    <p class="sub">Overall health ${overall}% · last checked ${new Date().toISOString()}</p>
    <div class="card">
      <ul>
${rows}
      </ul>
    </div>
    <footer>Generated by PingDeck. Host this file on a provider separate from the services it monitors.</footer>
  </div>
</body>
</html>`;
}

export async function run(input: RunInput): Promise<RunResult> {
  const serviceName = (input.serviceName ?? "").trim() || "Service";
  const lines = (input.urls ?? "")
    .split(/\r?\n|,/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) throw new Error("Add at least one URL, one per line.");
  if (lines.length > MAX_URLS) throw new Error(`The free tier checks up to ${MAX_URLS} URLs per run. You sent ${lines.length}.`);

  const urls = lines.map(normaliseUrl);

  const monitors: Monitor[] = await Promise.all(
    urls.map(async (url, i): Promise<Monitor> => {
      const [http, cert, domain] = await Promise.all([
        checkHttp(url),
        url.protocol === "https:" ? checkCert(url.hostname, url.port ? Number(url.port) : 443) : Promise.resolve<CertResult>({
          available: false,
          issuer: null,
          subject: null,
          validFrom: null,
          validTo: null,
          daysRemaining: null,
          hostnameMatches: null,
          error: "URL is not https, no certificate to check",
        }),
        checkDomain(url.hostname),
      ]);

      const problems: Monitor["problems"] = [];

      if (!http.ok) {
        problems.push({
          title: http.status ? `Returns HTTP ${http.status}` : "No response",
          detail: http.error ?? `The final URL ${http.finalUrl} returned ${http.status}.`,
          severity: "high",
        });
      }
      if (http.ok && http.ms > 2000) {
        problems.push({
          title: `Slow response — ${http.ms} ms`,
          detail: "Anything over two seconds to first byte will cost you conversions and search ranking.",
          severity: "medium",
        });
      }
      if (http.redirects.length > 1) {
        problems.push({
          title: `${http.redirects.length} redirect hops`,
          detail: `Chain: ${http.redirects.join(" ")}. Collapse this to a single redirect — each hop adds a full round trip.`,
          severity: "low",
        });
      }
      if (url.protocol === "https:" && cert.available) {
        if (cert.daysRemaining !== null && cert.daysRemaining < 0) {
          problems.push({
            title: `Certificate EXPIRED ${Math.abs(cert.daysRemaining)} days ago`,
            detail: `Every visitor is seeing a browser security warning right now. Expired ${cert.validTo}.`,
            severity: "high",
          });
        } else if (cert.daysRemaining !== null && cert.daysRemaining <= 14) {
          problems.push({
            title: `Certificate expires in ${cert.daysRemaining} days`,
            detail: `Valid until ${cert.validTo}. If auto-renewal were working it would usually have renewed by now — verify it manually.`,
            severity: "high",
          });
        } else if (cert.daysRemaining !== null && cert.daysRemaining <= 30) {
          problems.push({
            title: `Certificate expires in ${cert.daysRemaining} days`,
            detail: `Valid until ${cert.validTo}. Confirm renewal is scheduled.`,
            severity: "medium",
          });
        }
        if (cert.hostnameMatches === false) {
          problems.push({
            title: "Certificate hostname does not match",
            detail: `The certificate is issued for ${cert.subject ?? "another host"} but was served for ${url.hostname}. Browsers will reject this.`,
            severity: "high",
          });
        }
      } else if (url.protocol === "https:" && cert.error) {
        problems.push({
          title: "Could not read the TLS certificate",
          detail: cert.error,
          severity: "medium",
        });
      }
      if (url.protocol !== "https:") {
        problems.push({
          title: "Monitored over plain http",
          detail: "Serve this over https and redirect http traffic to it.",
          severity: "high",
        });
      }
      if (domain.available && domain.daysRemaining !== null) {
        if (domain.daysRemaining < 0) {
          problems.push({
            title: `Domain registration EXPIRED ${Math.abs(domain.daysRemaining)} days ago`,
            detail: "This takes down the site and the email on the domain simultaneously. Renew immediately.",
            severity: "high",
          });
        } else if (domain.daysRemaining <= 30) {
          problems.push({
            title: `Domain expires in ${domain.daysRemaining} days`,
            detail: `Registered until ${domain.expiryDate}${domain.registrar ? ` with ${domain.registrar}` : ""}. Check the card on file, not just the auto-renew flag.`,
            severity: domain.daysRemaining <= 7 ? "high" : "medium",
          });
        }
      }

      const highest = problems.some((p) => p.severity === "high")
        ? "down"
        : problems.some((p) => p.severity === "medium")
          ? "degraded"
          : "up";
      const state: Monitor["state"] = !http.ok ? "down" : highest === "down" ? "down" : highest === "degraded" ? "degraded" : "up";

      return { input: lines[i], url, http, cert, domain, state, problems };
    }),
  );

  const up = monitors.filter((m) => m.state === "up");
  const degraded = monitors.filter((m) => m.state === "degraded");
  const down = monitors.filter((m) => m.state === "down");

  const overall = Math.round(((up.length + degraded.length * 0.5) / monitors.length) * 100);
  const band = overall >= 90 ? "good" : overall >= 60 ? "warn" : "bad";

  const responded = monitors.filter((m) => m.http.status !== null);
  const avgMs = responded.length > 0 ? Math.round(responded.reduce((s, m) => s + m.http.ms, 0) / responded.length) : 0;

  const certSoonest = monitors
    .filter((m) => m.cert.daysRemaining !== null)
    .sort((a, b) => (a.cert.daysRemaining ?? 0) - (b.cert.daysRemaining ?? 0))[0];
  const domainSoonest = monitors
    .filter((m) => m.domain.daysRemaining !== null)
    .sort((a, b) => (a.domain.daysRemaining ?? 0) - (b.domain.daysRemaining ?? 0))[0];

  const problemItems = (severity: Severity): ResultItem[] =>
    monitors.flatMap((m) =>
      m.problems
        .filter((p) => p.severity === severity)
        .map((p) => ({ title: `${m.url.hostname} — ${p.title}`, body: p.detail, severity, tag: m.url.hostname })),
    );

  const headline =
    down.length > 0
      ? `${down.length} of ${monitors.length} endpoints need attention now. ${down[0].url.hostname}: ${down[0].problems[0]?.title.toLowerCase()}.`
      : degraded.length > 0
        ? `All ${monitors.length} endpoints respond, but ${degraded.length} ${degraded.length === 1 ? "is" : "are"} degraded. Average response ${avgMs} ms.`
        : `All ${monitors.length} endpoints healthy. Average response ${avgMs} ms${certSoonest?.cert.daysRemaining !== undefined && certSoonest?.cert.daysRemaining !== null ? `, soonest certificate expiry in ${certSoonest.cert.daysRemaining} days` : ""}.`;

  return {
    headline,
    score: { label: "Overall health", value: overall, max: 100, band },
    metrics: [
      { label: "Up", value: `${up.length}/${monitors.length}`, hint: `${down.length} down, ${degraded.length} degraded` },
      { label: "Avg response", value: `${avgMs} ms`, hint: `${responded.length} responded` },
      {
        label: "Soonest cert expiry",
        value: certSoonest?.cert.daysRemaining !== null && certSoonest?.cert.daysRemaining !== undefined ? `${certSoonest.cert.daysRemaining}d` : "—",
        hint: certSoonest?.url.hostname,
      },
      {
        label: "Soonest domain expiry",
        value: domainSoonest?.domain.daysRemaining !== null && domainSoonest?.domain.daysRemaining !== undefined ? `${domainSoonest.domain.daysRemaining}d` : "—",
        hint: domainSoonest?.domain.apex ?? undefined,
      },
    ],
    table: {
      columns: ["Endpoint", "State", "Status", "Time", "Redirects", "Cert days", "Domain days"],
      rows: monitors.map((m) => [
        m.url.hostname + (m.url.pathname === "/" ? "" : m.url.pathname),
        m.state === "up" ? "Operational" : m.state === "degraded" ? "Degraded" : "Down",
        m.http.status !== null ? String(m.http.status) : "no response",
        `${m.http.ms} ms`,
        String(m.http.redirects.length),
        m.cert.daysRemaining !== null ? String(m.cert.daysRemaining) : "—",
        m.domain.daysRemaining !== null ? String(m.domain.daysRemaining) : "—",
      ]),
    },
    sections: [
      { title: `Needs attention now (${problemItems("high").length})`, items: problemItems("high") },
      { title: `Degraded (${problemItems("medium").length})`, items: problemItems("medium") },
      { title: `Worth tidying (${problemItems("low").length})`, items: problemItems("low") },
      {
        title: "Certificate detail",
        items: monitors.map((m) => ({
          title: m.url.hostname,
          body: m.cert.available
            ? `Issued by ${m.cert.issuer ?? "unknown"} to ${m.cert.subject ?? "unknown"}. Valid ${m.cert.validFrom} → ${m.cert.validTo} (${m.cert.daysRemaining} days left). Hostname match: ${m.cert.hostnameMatches ? "yes" : "no"}.`
            : `Not available — ${m.cert.error ?? "unknown reason"}.`,
          tag: m.cert.available ? "TLS" : "unavailable",
        })),
      },
      {
        title: "Domain registration detail",
        items: monitors.map((m) => ({
          title: m.domain.apex ?? m.url.hostname,
          body: m.domain.available
            ? `Registered until ${m.domain.expiryDate}${m.domain.registrar ? ` via ${m.domain.registrar}` : ""} — ${m.domain.daysRemaining} days remaining.`
            : `Not available — ${m.domain.error ?? "unknown reason"}.`,
          tag: m.domain.available ? "RDAP" : "unavailable",
        })),
      },
    ],
    copyBlocks: [
      { title: "Public status page (self-contained HTML)", text: statusPageHtml(serviceName, monitors, overall), language: "html" },
    ],
    json: {
      serviceName,
      checkedAt: new Date().toISOString(),
      overallHealth: overall,
      band,
      summary: { total: monitors.length, up: up.length, degraded: degraded.length, down: down.length, averageResponseMs: avgMs },
      monitors: monitors.map((m) => ({
        input: m.input,
        url: m.url.toString(),
        hostname: m.url.hostname,
        state: m.state,
        http: m.http,
        certificate: m.cert,
        domain: m.domain,
        problems: m.problems,
      })),
    },
  };
}
