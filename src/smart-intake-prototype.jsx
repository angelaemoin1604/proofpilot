import { useState, useEffect, useRef } from "react";
import mammoth from "mammoth";

// ----------------------------------------------------------------------
// PROOFPILOT - Answers you can audit
// AI fills vendor questionnaires with proof lines, confidence and flags.
// ----------------------------------------------------------------------

const INK = "#1A1F36";
const INDIGO = "#5B5BD6";
const INDIGO_DK = "#4646C6";
const VIOLET = "#7C5CE0";
const TEAL = "#0E8074";
const GREEN = "#059669";
const AMBER = "#D97706";
const RED = "#DC2626";

const STARTER_QUESTIONS = [
  { id: 1, text: "Do you encrypt customer data at rest?", cat: "Data protection" },
  { id: 2, text: "Do you encrypt data in transit?", cat: "Data protection" },
  { id: 3, text: "Do you have a documented incident response plan?", cat: "Incident response" },
  { id: 4, text: "Do you perform annual penetration testing?", cat: "Security testing" },
  { id: 5, text: "Do you enforce multi-factor authentication (MFA) for employee access?", cat: "Access control" },
  { id: 6, text: "Do you have a subprocessor / vendor management policy?", cat: "Vendor management" },
  { id: 7, text: "Do you hold a SOC 2 Type II or ISO 27001 certification?", cat: "Compliance" },
  { id: 8, text: "Do you have a data retention and deletion policy?", cat: "Data lifecycle" },
];

const EXTRA_QUESTIONS = [
  { id: 9, text: "How are encryption keys managed, and how often are they rotated?", cat: "Data protection" },
  { id: 10, text: "Do you maintain a data classification policy?", cat: "Data protection" },
  { id: 11, text: "Is access granted on a least-privilege basis, with periodic access reviews?", cat: "Access control" },
  { id: 12, text: "Is privileged access to production managed and are privileged sessions recorded?", cat: "Access control" },
  { id: 13, text: "Are unused or leaver accounts deactivated within a defined time period?", cat: "Access control" },
  { id: 14, text: "Do you commit to notifying customers of security incidents within a defined timeline?", cat: "Incident response" },
  { id: 15, text: "Do you classify incidents by severity with defined response timelines?", cat: "Incident response" },
  { id: 16, text: "Do you run regular automated vulnerability scans on production systems?", cat: "Security testing" },
  { id: 17, text: "Do you have defined remediation SLAs based on vulnerability severity?", cat: "Security testing" },
  { id: 18, text: "Do you operate a bug bounty or responsible disclosure program?", cat: "Security testing" },
  { id: 19, text: "If you process payments, are you PCI DSS compliant?", cat: "Compliance" },
  { id: 20, text: "Are you compliant with GDPR or equivalent data privacy regulations?", cat: "Compliance" },
  { id: 21, text: "Do you sign Data Processing Agreements (DPAs) with your subprocessors?", cat: "Vendor management" },
  { id: 22, text: "Are customers notified when subprocessors are added or changed?", cat: "Vendor management" },
  { id: 23, text: "Do you maintain a current, accessible list of your critical subprocessors?", cat: "Vendor management" },
  { id: 24, text: "Is customer data deleted using a recognised secure-deletion standard (e.g. NIST SP 800-88)?", cat: "Data lifecycle" },
  { id: 25, text: "Are audit logs retained for at least 12 months?", cat: "Data lifecycle" },
  { id: 26, text: "Do you disclose where customer data is stored (data residency / regions)?", cat: "Data lifecycle" },
  { id: 27, text: "Do you maintain a documented and tested business continuity / disaster recovery plan?", cat: "Business continuity" },
  { id: 28, text: "Do you commit to a defined uptime SLA?", cat: "Business continuity" },
  { id: 29, text: "Do you have defined Recovery Time Objective (RTO) and Recovery Point Objective (RPO)?", cat: "Business continuity" },
  { id: 30, text: "Do employees receive regular security awareness training and background checks?", cat: "People security" },
];

const FULL_QUESTIONS = [...STARTER_QUESTIONS, ...EXTRA_QUESTIONS];

const SAMPLE_DOCS = {
  mature: {
    label: "Helios Cloud - mature vendor",
    text: `Helios Cloud Services - Information Security Policy (excerpt, v5.0)

1. Data Protection. All customer data stored in Helios production systems is encrypted at rest using AES-256. All data exchanged between clients and Helios services is encrypted in transit using TLS 1.2 or higher. Encryption keys are managed through a dedicated key management service and rotated every 12 months. Helios maintains a formal data classification policy covering Public, Internal, Confidential and Restricted tiers.

2. Access Control. Access to production systems is granted on a least-privilege basis and access rights are reviewed quarterly. Multi-factor authentication is mandatory for all employees and contractors accessing internal systems. All privileged access to production is managed through a Privileged Access Management solution, and privileged sessions are recorded. Unused accounts are deactivated after 30 days of inactivity, and leaver accounts are disabled on the last working day.

3. Incident Response. Helios maintains a documented Incident Response Plan, reviewed twice a year and tested through annual tabletop exercises. Incidents are classified into four severity levels with defined response timelines for each level. Affected customers are notified of confirmed security incidents within 72 hours.

4. Security Testing. An independent third party performs penetration testing of the Helios platform once per year. Automated vulnerability scans run weekly across all production systems. Findings are remediated under severity-based SLAs: Critical within 7 days, High within 30 days, Medium within 90 days.

5. Compliance. Helios undergoes an annual SOC 2 Type II audit; the latest report is available under NDA. Helios does not currently hold ISO 27001 certification; a gap assessment is in progress. Payment processing is handled by Stripe, which is PCI DSS Level 1 certified.

6. Vendor Management. Helios maintains a formal Subprocessor and Vendor Management Policy, and all vendors undergo a security review before onboarding. Data Processing Agreements are signed with every subprocessor that handles customer data. A current list of critical subprocessors is published on the Helios Trust Center. Customers are notified by email at least 30 days before any subprocessor change.

7. Data Lifecycle. Customer data is retained for the duration of the contract and deleted within 30 days of termination using NIST SP 800-88 compliant methods. Audit logs and security event records are retained for a minimum of 12 months. Customer data is stored in the AWS Mumbai and Ireland regions.

8. Business Continuity. Helios maintains a documented Business Continuity and Disaster Recovery Plan, tested annually through failover exercises. The platform is operated to a 99.9% monthly uptime commitment. Recovery Time Objective is 4 hours and Recovery Point Objective is 1 hour.`,
  },
  early: {
    label: "Nimbus Labs - early-stage vendor",
    text: `Nimbus Labs - Security Overview (internal draft)

Nimbus Labs takes security seriously. Our application is hosted on a major cloud provider, and traffic to our app is served over HTTPS.

Employees sign in to internal tools using single sign-on. We are currently rolling out two-factor authentication across teams; engineering has adopted it, other departments are in progress.

If something goes wrong, the engineering team investigates and fixes issues quickly. We plan to write a formal incident response runbook this year.

We have not yet completed a third-party security audit or certification, but we follow industry best practices and intend to pursue SOC 2 in the future.

Customer data is backed up daily. Deletion requests are handled manually by the support team on request.`,
  },
};

const FALLBACK_RESULTS = [
  { id: 1, answer: "Yes", confidence: "High", evidence: "All customer data stored in Helios production systems is encrypted at rest using AES-256.", rationale: "AES-256 encryption at rest is explicitly stated.", needs_review: false },
  { id: 2, answer: "Yes", confidence: "High", evidence: "All data exchanged between clients and Helios services is encrypted in transit using TLS 1.2 or higher.", rationale: "TLS 1.2+ in transit is explicitly stated.", needs_review: false },
  { id: 3, answer: "Yes", confidence: "High", evidence: "Helios maintains a documented Incident Response Plan, reviewed twice a year and tested through annual tabletop exercises.", rationale: "A documented, tested incident response plan is described.", needs_review: false },
  { id: 4, answer: "Yes", confidence: "High", evidence: "An independent third party performs penetration testing of the Helios platform once per year.", rationale: "Annual third-party penetration testing is explicitly stated.", needs_review: false },
  { id: 5, answer: "Yes", confidence: "High", evidence: "Multi-factor authentication is mandatory for all employees and contractors accessing internal systems.", rationale: "MFA is mandatory for all staff.", needs_review: false },
  { id: 6, answer: "Yes", confidence: "High", evidence: "Helios maintains a formal Subprocessor and Vendor Management Policy, and all vendors undergo a security review before onboarding.", rationale: "A formal vendor management policy with pre-onboarding reviews is stated.", needs_review: false },
  { id: 7, answer: "Partial", confidence: "Medium", evidence: "Helios undergoes an annual SOC 2 Type II audit; the latest report is available under NDA.", rationale: "SOC 2 Type II is confirmed; ISO 27001 certification is explicitly not yet held.", needs_review: true, parts: [{ item: "SOC 2 Type II", status: "Confirmed" }, { item: "ISO 27001", status: "Not mentioned" }] },
  { id: 8, answer: "Yes", confidence: "High", evidence: "Customer data is retained for the duration of the contract and deleted within 30 days of termination using NIST SP 800-88 compliant methods.", rationale: "Retention and deletion timelines are explicitly defined.", needs_review: false },
  { id: 9, answer: "Yes", confidence: "High", evidence: "Encryption keys are managed through a dedicated key management service and rotated every 12 months.", rationale: "Key management and a 12-month rotation cycle are stated.", needs_review: false },
  { id: 10, answer: "Yes", confidence: "High", evidence: "Helios maintains a formal data classification policy covering Public, Internal, Confidential and Restricted tiers.", rationale: "A four-tier data classification policy exists.", needs_review: false },
  { id: 11, answer: "Yes", confidence: "High", evidence: "Access to production systems is granted on a least-privilege basis and access rights are reviewed quarterly.", rationale: "Least privilege with quarterly access reviews is stated.", needs_review: false },
  { id: 12, answer: "Yes", confidence: "High", evidence: "All privileged access to production is managed through a Privileged Access Management solution, and privileged sessions are recorded.", rationale: "PAM with session recording is explicitly stated.", needs_review: false },
  { id: 13, answer: "Yes", confidence: "High", evidence: "Unused accounts are deactivated after 30 days of inactivity, and leaver accounts are disabled on the last working day.", rationale: "Account deactivation timelines are defined for both cases.", needs_review: false },
  { id: 14, answer: "Yes", confidence: "High", evidence: "Affected customers are notified of confirmed security incidents within 72 hours.", rationale: "A 72-hour customer notification commitment is stated.", needs_review: false },
  { id: 15, answer: "Yes", confidence: "High", evidence: "Incidents are classified into four severity levels with defined response timelines for each level.", rationale: "Severity classification with timelines is stated.", needs_review: false },
  { id: 16, answer: "Yes", confidence: "High", evidence: "Automated vulnerability scans run weekly across all production systems.", rationale: "Weekly automated scanning is explicitly stated.", needs_review: false },
  { id: 17, answer: "Yes", confidence: "High", evidence: "Findings are remediated under severity-based SLAs: Critical within 7 days, High within 30 days, Medium within 90 days.", rationale: "Severity-based remediation SLAs are defined.", needs_review: false },
  { id: 18, answer: "Not found", confidence: "Low", evidence: "", rationale: "The document does not mention a bug bounty or responsible disclosure program.", needs_review: true },
  { id: 19, answer: "Yes", confidence: "Medium", evidence: "Payment processing is handled by Stripe, which is PCI DSS Level 1 certified.", rationale: "Payments are outsourced to a PCI DSS Level 1 certified processor; Helios itself holds no direct certification.", needs_review: true },
  { id: 20, answer: "Not found", confidence: "Low", evidence: "", rationale: "GDPR or equivalent privacy regulation compliance is not mentioned in the document.", needs_review: true },
  { id: 21, answer: "Yes", confidence: "High", evidence: "Data Processing Agreements are signed with every subprocessor that handles customer data.", rationale: "DPAs with all data-handling subprocessors are stated.", needs_review: false },
  { id: 22, answer: "Yes", confidence: "High", evidence: "Customers are notified by email at least 30 days before any subprocessor change.", rationale: "A 30-day advance notification commitment is stated.", needs_review: false },
  { id: 23, answer: "Yes", confidence: "High", evidence: "A current list of critical subprocessors is published on the Helios Trust Center.", rationale: "A public, current subprocessor list is maintained.", needs_review: false },
  { id: 24, answer: "Yes", confidence: "High", evidence: "deleted within 30 days of termination using NIST SP 800-88 compliant methods", rationale: "Deletion follows the NIST SP 800-88 standard.", needs_review: false },
  { id: 25, answer: "Yes", confidence: "High", evidence: "Audit logs and security event records are retained for a minimum of 12 months.", rationale: "A 12-month minimum log retention period is stated.", needs_review: false },
  { id: 26, answer: "Yes", confidence: "High", evidence: "Customer data is stored in the AWS Mumbai and Ireland regions.", rationale: "Data residency regions are explicitly disclosed.", needs_review: false },
  { id: 27, answer: "Yes", confidence: "High", evidence: "Helios maintains a documented Business Continuity and Disaster Recovery Plan, tested annually through failover exercises.", rationale: "A documented, annually tested BCP/DR plan is stated.", needs_review: false },
  { id: 28, answer: "Yes", confidence: "High", evidence: "The platform is operated to a 99.9% monthly uptime commitment.", rationale: "A 99.9% monthly uptime commitment is stated.", needs_review: false },
  { id: 29, answer: "Yes", confidence: "High", evidence: "Recovery Time Objective is 4 hours and Recovery Point Objective is 1 hour.", rationale: "RTO of 4 hours and RPO of 1 hour are defined.", needs_review: false },
  { id: 30, answer: "Not found", confidence: "Low", evidence: "", rationale: "Security awareness training and background checks are not mentioned in the document.", needs_review: true },
];

const PHASES = [
  "Reading the document",
  "Matching questions to proof lines",
  "Scoring confidence",
  "Flagging items for your review",
];

const CONFETTI = [
  { l: "6%", d: "0s", c: "#FDE68A", t: "1.6s" }, { l: "18%", d: ".2s", c: "#A7F3D0", t: "1.9s" },
  { l: "30%", d: ".05s", c: "#C7D2FE", t: "1.7s" }, { l: "42%", d: ".3s", c: "#FBCFE8", t: "2s" },
  { l: "54%", d: ".12s", c: "#FDE68A", t: "1.8s" }, { l: "66%", d: ".25s", c: "#99F6E4", t: "1.6s" },
  { l: "78%", d: ".08s", c: "#C7D2FE", t: "2.1s" }, { l: "90%", d: ".18s", c: "#A7F3D0", t: "1.7s" },
];

const GLOBAL_CSS = `
  @keyframes ppFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ppFadeDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes ppScaleIn { from { opacity: 0; transform: scale(.92); } to { opacity: 1; transform: scale(1); } }
  @keyframes ppShimmer { 0% { background-position: -480px 0; } 100% { background-position: 480px 0; } }
  @keyframes ppScan { 0% { top: 0; opacity: 0; } 8% { opacity: 1; } 92% { opacity: 1; } 100% { top: calc(100% - 3px); opacity: 0; } }
  @keyframes ppPulseDot { 0%,100% { transform: scale(1); opacity: .9; } 50% { transform: scale(1.6); opacity: .35; } }
  @keyframes ppPop { 0% { transform: scale(.4); opacity: 0; } 70% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
  @keyframes ppFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  @keyframes ppDrift { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(18px,-14px) scale(1.08); } }
  @keyframes ppGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  @keyframes ppConfetti { 0% { transform: translateY(-10px) rotate(0); opacity: 1; } 100% { transform: translateY(90px) rotate(320deg); opacity: 0; } }
  @keyframes ppFlash { 0% { box-shadow: 0 0 0 0 rgba(91,91,214,.55); } 100% { box-shadow: 0 0 0 14px rgba(91,91,214,0); } }
  .pp-card { transition: transform .25s ease, box-shadow .25s ease; }
  .pp-card:hover { transform: translateY(-2px); box-shadow: 0 14px 34px rgba(26,31,54,.10); }
  .pp-btn { position: relative; overflow: hidden; transition: transform .15s ease, box-shadow .2s ease, opacity .2s; }
  .pp-btn:hover { transform: translateY(-1px); }
  .pp-btn:active { transform: translateY(0) scale(.98); }
  .pp-btn::after { content: ""; position: absolute; top: 0; left: -80%; width: 50%; height: 100%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.45), transparent); transform: skewX(-20deg); transition: left .5s ease; }
  .pp-btn:hover::after { left: 130%; }
  .pp-chipbtn { transition: all .18s ease; }
  .pp-chipbtn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(26,31,54,.12); }
  .pp-hl { position: relative; border-radius: 4px; padding: 1px 3px; cursor: pointer; transition: filter .15s ease; }
  .pp-hl:hover { filter: brightness(.92); }
  .pp-hl.proof { background: rgba(16,185,129,.30); box-shadow: inset 0 -2px 0 #059669; }
  .pp-hl.rel { background: rgba(245,158,11,.32); box-shadow: inset 0 -2px 0 #D97706; }
  .pp-hl:hover::after { content: attr(data-q); position: absolute; bottom: calc(100% + 8px); left: 0; background: #1A1F36; color: #fff; padding: 7px 11px; border-radius: 9px; font-size: 11px; font-weight: 600; line-height: 1.4; width: max-content; max-width: 280px; white-space: normal; z-index: 40; box-shadow: 0 10px 24px rgba(26,31,54,.3); }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation: none !important; transition: none !important; }
  }
`;

function useCountUp(target, run, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) { setVal(0); return; }
    let start = null, raf;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return val;
}

function Logo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <defs>
        <linearGradient id="ppLogo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6D5BE0" />
          <stop offset="100%" stopColor="#11B395" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#ppLogo)" />
      <rect x="9" y="9" width="4.5" height="7" rx="2" fill="rgba(255,255,255,.85)" />
      <rect x="16" y="9" width="4.5" height="7" rx="2" fill="rgba(255,255,255,.55)" />
      <path d="M11 24 L17.5 30.5 L30 16.5" stroke="#fff" strokeWidth="4.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrustRing({ pct }) {
  const R = 44, C = 2 * Math.PI * R;
  const [offset, setOffset] = useState(C);
  useEffect(() => {
    const t = setTimeout(() => setOffset(C - (pct / 100) * C), 150);
    return () => clearTimeout(t);
  }, [pct, C]);
  const shown = useCountUp(pct, true, 1100);
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative" style={{ width: 122, height: 122 }}>
        <svg width="122" height="122" viewBox="0 0 122 122" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="61" cy="61" r={R} fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="9" />
          <circle cx="61" cy="61" r={R} fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-white font-bold leading-none" style={{ fontSize: 30 }}>{shown}<span style={{ fontSize: 16, opacity: .85 }}>%</span></div>
          <div className="mt-1" style={{ fontSize: 10, color: "rgba(255,255,255,.85)" }}>with proof</div>
        </div>
      </div>
      <span className="text-xs font-bold" style={{ color: "rgba(255,255,255,.95)", letterSpacing: ".05em" }}>ANSWERS VERIFIED WITH PROOF</span>
    </div>
  );
}

function StatTile({ value, label, run }) {
  const v = useCountUp(value, run);
  return (
    <div className="rounded-xl px-3.5 py-3" style={{ background: "rgba(255,255,255,.16)", border: "1px solid rgba(255,255,255,.28)" }}>
      <div className="text-2xl font-bold leading-none text-white">{v}</div>
      <div className="text-xs mt-1.5 leading-snug" style={{ color: "rgba(255,255,255,.85)" }}>{label}</div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  const active = value !== "all";
  return (
    <label className="pp-chipbtn inline-flex items-center gap-1 rounded-full pl-3 pr-1.5 py-1.5 text-xs font-bold cursor-pointer"
      style={{
        background: active ? "#EEF0FB" : "#fff",
        border: active ? `1.5px solid ${INDIGO}` : "1.5px solid #DDE0E8",
        color: "#5A6072",
      }}>
      {label}:
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="text-xs font-bold outline-none cursor-pointer"
        style={{ color: INDIGO_DK, border: "none", background: "transparent" }}>
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </label>
  );
}

// ---------- Robust AI plumbing ----------
function extractJsonArray(text) {
  const clean = text.replace(/```json|```/gi, "").trim();
  const a = clean.indexOf("["), b = clean.lastIndexOf("]");
  if (a !== -1 && b > a) return JSON.parse(clean.slice(a, b + 1));
  const c = clean.indexOf("{"), d = clean.lastIndexOf("}");
  if (c !== -1 && d > c) return [JSON.parse(clean.slice(c, d + 1))];
  throw new Error("No JSON found in AI reply");
}

async function callClaude(prompt) {
  let lastErr = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      if (data && data.error) throw new Error(data.error.message || "API returned an error");
      const text = (data.content || []).map((b) => (b.type === "text" ? b.text : "")).join("\n");
      if (!text.trim()) throw new Error("Empty AI reply");
      return extractJsonArray(text);
    } catch (err) {
      lastErr = err;
      console.warn("AI call attempt " + attempt + " failed:", err);
    }
  }
  throw lastErr || new Error("AI call failed");
}

function lexicalLookup(question, doc) {
  const stop = new Set(["do","you","your","the","a","an","of","to","and","or","is","are","was","were","have","has","had","for","in","on","at","with","any","we","our","does","did","how","what","when","where","which","who","will","can","could","should","would","there","their","they","them","this","that","these","those","be","been","being","it","its","from","by","as","if","not","no","yes","please","about"]);
  const words = question.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !stop.has(w));
  const sentences = (doc.replace(/\n+/g, " ").match(/[^.!?]+[.!?]?/g) || []).map((s) => s.trim()).filter((s) => s.length > 15);
  let best = "", bestScore = 0;
  for (const s of sentences) {
    const sl = s.toLowerCase();
    let score = 0;
    for (const w of words) if (sl.includes(w)) score++;
    if (score > bestScore) { bestScore = score; best = s; }
  }
  return bestScore >= 1 ? best : "";
}

// Offline mode for the user's own documents: honest keyword search per question
function offlineResults(qList, doc) {
  return qList.map((q) => {
    const related = lexicalLookup(q.text, doc);
    return {
      id: q.id,
      answer: "Not found",
      confidence: "Low",
      evidence: "",
      related_excerpt: related,
      rationale: related
        ? "Offline demo: closest matching line found by keyword search - live AI would verify and give the full answer."
        : "Offline demo: keyword search found nothing related in this document - live AI would confirm.",
      needs_review: true,
    };
  });
}

// ---------- Locate a quote: line number (and page for PDFs) ----------
function findLocation(quote, doc, pages) {
  if (!quote) return null;
  const norm = (s) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim();
  const nq = norm(quote);
  const head = nq.split(" ").slice(0, 6).join(" ");
  const lines = doc.split("\n");
  let lineNo = null;
  for (let i = 0; i < lines.length; i++) {
    const nl = norm(lines[i]);
    if (nl && (nl.includes(nq) || nl.includes(head))) { lineNo = i + 1; break; }
  }
  let pageNo = null;
  if (pages && pages.length > 1) {
    for (let p = 0; p < pages.length; p++) {
      const np = norm(pages[p]);
      if (np.includes(nq) || np.includes(head)) { pageNo = p + 1; break; }
    }
  }
  if (lineNo === null && pageNo === null) return null;
  return { line: lineNo, page: pageNo };
}

// ---------- Build highlight spans for the Answer Map ----------
function buildHighlights(doc, items) {
  const found = [];
  const flex = (s) => s
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/['’‘]/g, "['’‘]")
    .replace(/["“”]/g, "[\"“”]")
    .replace(/\s+/g, "\\s+");
  for (const it of items) {
    if (!it.quote) continue;
    let m = null;
    try { m = doc.match(new RegExp(flex(it.quote), "i")); } catch (e) { /* skip */ }
    if (!m) {
      const head = it.quote.split(/\s+/).slice(0, 8).join(" ");
      if (head.length > 12) {
        try { m = doc.match(new RegExp(flex(head), "i")); } catch (e) { /* skip */ }
      }
    }
    if (m && m.index !== undefined) found.push({ start: m.index, end: m.index + m[0].length, ...it });
  }
  found.sort((a, b) => a.start - b.start);
  const out = []; let last = 0;
  for (const f of found) { if (f.start < last) continue; out.push(f); last = f.end; }
  return out;
}

// Detect mixed verdicts inside a plain rationale sentence, e.g.
// "SOC 2 Type II is confirmed; ISO 27001 certification is explicitly not yet held."
function splitFindings(rationale) {
  if (!rationale) return null;
  const clauses = rationale
    .split(/;|(?:\.\s+)|(?:,?\s+but\s+)|(?:,?\s+however,?\s+)|(?:,?\s+while\s+)|(?:,?\s+whereas\s+)/i)
    .map((c) => c.trim().replace(/\.$/, ""))
    .filter((c) => c.length > 3);
  if (clauses.length < 2) return null;
  const NEG = /\b(not|no|never|missing|absent|lacking|unclear|without|yet to|isn'?t|aren'?t|doesn'?t|don'?t|cannot|can'?t|fails?)\b/i;
  const PART = /\b(in progress|partial(ly)?|rolling out|pending|planned|some|incomplete|expects? to|intends? to)\b/i;
  const findings = clauses.map((c) => ({
    text: c,
    status: NEG.test(c) ? "neg" : PART.test(c) ? "part" : "pos",
  }));
  const hasPos = findings.some((f) => f.status === "pos");
  const hasNonPos = findings.some((f) => f.status !== "pos");
  return hasPos && hasNonPos ? findings : null;
}

// ---------- Prefilled follow-up message templates ----------
function buildFollowup(q, r) {
  const missing = (r.parts || []).filter((p) => p.status !== "Confirmed").map((p) => p.item);
  const topic = missing.length ? missing.join(" and ") : q.text.replace(/^Do you /i, "").replace(/\?$/, "");
  const subject = "Quick confirmation needed - " + topic.charAt(0).toUpperCase() + topic.slice(1);
  let context = "";
  if (missing.length) context = "\nFrom your document we could confirm some parts, but we could not find: " + missing.join(", ") + ".\n";
  else if (r.related_excerpt) context = '\nFor context, the closest information we found in your document was: "' + r.related_excerpt + '". We could not treat this as a confirmed answer.\n';
  else if (!r.evidence) context = "\nWe could not find this topic covered in the document you shared with us.\n";
  const body = "Dear Team,\n\nWe are reviewing your security questionnaire as part of our vendor due diligence, and we need one clarification from you.\n\nQuestion: \"" + q.text + "\"\n" + context + "\nCould you please:\n1. Confirm whether this is in place at your organisation.\n2. Share the policy document, certificate, or report section that confirms it.\n\nOnce we receive this, we can complete your review without delay. Thank you for your help.\n\nBest regards,\n[Your name]\nRisk and Compliance Team";
  const chat = "Hi team! One quick check for your security review: \"" + q.text + "\" - we could not find a clear answer in the document you shared." + (missing.length ? " Specifically missing: " + missing.join(", ") + "." : r.related_excerpt ? ' The closest line we found was: "' + r.related_excerpt + '".' : "") + " Could you confirm and share the related policy or certificate? Thanks a lot!";
  return { subject, body, chat };
}

export default function ProofPilot() {
  const [docKey, setDocKey] = useState("mature");
  const [customText, setCustomText] = useState("");
  const [fileInfo, setFileInfo] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [filePages, setFilePages] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [qSetKey, setQSetKey] = useState("starter");
  const [questions, setQuestions] = useState(STARTER_QUESTIONS);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState(0);
  const [error, setError] = useState(null);
  const [fallbackCount, setFallbackCount] = useState(0);
  const [runNote, setRunNote] = useState("");
  const [decisions, setDecisions] = useState({});
  const [activeAction, setActiveAction] = useState(null); // {id, type:'approve'|'edit'|'followup'}
  const [draft, setDraft] = useState("");
  const [fuChannel, setFuChannel] = useState("email");
  const [fuSubject, setFuSubject] = useState("");
  const [fuBody, setFuBody] = useState("");
  const [fuChat, setFuChat] = useState("");
  const [editAnswer, setEditAnswer] = useState("Yes");
  const [copiedKey, setCopiedKey] = useState(null);
  const [filter, setFilter] = useState("all");
  const [ansFilter, setAnsFilter] = useState("all");
  const [confFilter, setConfFilter] = useState("all");
  const [decisionFilter, setDecisionFilter] = useState("all");
  const [showQInfo, setShowQInfo] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [customQuestion, setCustomQuestion] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [askInfo, setAskInfo] = useState(null);
  const [flashId, setFlashId] = useState(null);
  const resultsRef = useRef(null);
  const mapRef = useRef(null);
  const scrolledRef = useRef(false);

  const docText = docKey === "custom" ? customText : SAMPLE_DOCS[docKey].text;
  const baseSet = qSetKey === "full" ? FULL_QUESTIONS : STARTER_QUESTIONS;
  const pages = docKey === "custom" ? filePages : null;

  useEffect(() => {
    if (!loading) return;
    setPhase(0);
    const iv = setInterval(() => setPhase((p) => Math.min(p + 1, PHASES.length - 1)), 1000);
    return () => clearInterval(iv);
  }, [loading]);

  useEffect(() => {
    if (results && !scrolledRef.current && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      scrolledRef.current = true;
    }
    if (!results) scrolledRef.current = false;
  }, [results]);

  function resetAll() {
    setResults(null); setDecisions({}); setError(null);
    setFilter("all"); setAnsFilter("all"); setConfFilter("all"); setDecisionFilter("all");
    setActiveAction(null); setDraft("");
    setQuestions(baseSet); setSearchQ("");
    setCustomQuestion(""); setAskInfo(null);
  }

  async function copyText(t, key) {
    try { await navigator.clipboard.writeText(t); }
    catch (e) {
      const ta = document.createElement("textarea");
      ta.value = t; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (_) {}
      document.body.removeChild(ta);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }

  // ---------- File upload ----------
  async function extractPdf(file) {
    if (!window.pdfjsLib) {
      await new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        s.onload = res; s.onerror = () => rej(new Error("PDF reader could not load - please paste the text instead."));
        document.head.appendChild(s);
      });
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    }
    const buf = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
    const pageTexts = [];
    const n = Math.min(pdf.numPages, 25);
    for (let i = 1; i <= n; i++) {
      const page = await pdf.getPage(i);
      const tc = await page.getTextContent();
      pageTexts.push(tc.items.map((it) => it.str).join(" "));
    }
    return pageTexts;
  }

  async function handleFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setFileError(null); setFileInfo(null); setFilePages(null); setParsing(true);
    try {
      const name = f.name.toLowerCase();
      let text = ""; let pagesArr = null;
      if (name.endsWith(".txt") || name.endsWith(".md")) {
        text = await f.text();
      } else if (name.endsWith(".docx")) {
        const buf = await f.arrayBuffer();
        const res = await mammoth.extractRawText({ arrayBuffer: buf });
        text = res.value;
      } else if (name.endsWith(".pdf")) {
        pagesArr = await extractPdf(f);
        text = pagesArr.join("\n\n");
      } else if (name.endsWith(".doc")) {
        throw new Error("Old .doc format is not supported - save as .docx or paste the text.");
      } else {
        throw new Error("Unsupported file - use PDF, Word (.docx) or TXT.");
      }
      text = (text || "").replace(/\s+\n/g, "\n").trim();
      if (!text) throw new Error("No readable text found (scanned PDFs need OCR) - please paste the text instead.");
      setCustomText(text);
      resetAll();
      setFilePages(pagesArr);
      setFileInfo({ name: f.name, chars: text.length, pages: pagesArr ? pagesArr.length : null });
    } catch (err) {
      setFileError(err.message || "Could not read the file - please paste the text instead.");
    } finally {
      setParsing(false);
      e.target.value = "";
    }
  }

  // ---------- Prompt rules ----------
  const RULES = `Respond ONLY with a raw JSON array (no markdown, no backticks, no preamble). One object per question:
{"id": <number>, "answer": "Yes"|"No"|"Partial"|"Not found", "confidence": "High"|"Medium"|"Low", "evidence": "<short exact quote from the document that DIRECTLY answers the question, or empty string>", "related_excerpt": "<only when evidence is empty: the closest topically-related exact quote from the document, or empty string if nothing related exists>", "rationale": "<one plain-English sentence>", "needs_review": <true if confidence is not High, or answer is Partial/Not found/No>, "parts": [include ONLY when the question asks about two or more distinct items (e.g. "X or Y"); one entry per item: {"item": "<name>", "status": "Confirmed"|"Partially covered"|"Not mentioned"}]}
Rules: "evidence" must directly prove the answer - never put loosely related text there. If the document does not directly answer, set answer to "Not found", leave evidence empty, and put the closest related exact line (if any) in "related_excerpt". Use "Partial" when a control is incomplete, in progress, or only some parts of the question are confirmed. If the rationale mentions one item as confirmed and another as missing or not held, the "parts" array is REQUIRED. Keep "evidence" and "related_excerpt" under 25 words each and "rationale" under 15 words. Be conservative: when in doubt, lower confidence and set needs_review true.`;

  // ---------- AI fill ----------
  async function runPrefill() {
    if (!docText.trim()) { setError("Upload a file or paste a policy document first."); return; }
    const qList = baseSet;
    setLoading(true); setError(null); setResults(null); setDecisions({});
    setFallbackCount(0); setRunNote(""); setFilter("all"); setAnsFilter("all"); setConfFilter("all"); setDecisionFilter("all");
    setActiveAction(null); setDraft(""); setQuestions(qList); setSearchQ(""); setAskInfo(null);

    const makePrompt = (chunk) => `You are an AI assistant inside a third-party risk review platform. A vendor has provided a security policy document. Answer the security questionnaire below using ONLY information found in the document. Never assume anything that is not stated.

DOCUMENT:
"""
${docText.slice(0, 12000)}
"""

QUESTIONNAIRE:
${chunk.map((q) => `${q.id}. ${q.text}`).join("\n")}

${RULES}`;

    const chunks = [];
    for (let i = 0; i < qList.length; i += 8) chunks.push(qList.slice(i, i + 8));

    const minDelay = new Promise((r) => setTimeout(r, 3600));
    const collected = [];
    let offline = 0;
    try {
      for (let ci = 0; ci < chunks.length; ci++) {
        const chunk = chunks[ci];
        if (chunks.length > 1) setRunNote(`Answering questions ${chunk[0].id}-${chunk[chunk.length - 1].id} of ${qList.length}…`);
        try {
          const parsed = await callClaude(makePrompt(chunk));
          const arr = Array.isArray(parsed) ? parsed : [parsed];
          const got = chunk.map((q) => arr.find((x) => x && x.id === q.id && x.answer));
          if (got.some((g) => !g)) throw new Error("Incomplete chunk reply");
          collected.push(...got);
        } catch (err) {
          console.warn("Chunk " + (ci + 1) + " fell back to offline answers:", err);
          offline += chunk.length;
          if (docKey === "mature") {
            collected.push(...FALLBACK_RESULTS.filter((fr) => chunk.some((q) => q.id === fr.id)));
          } else {
            collected.push(...offlineResults(chunk, docText));
          }
        }
      }
      await minDelay;
      setResults(collected);
      setFallbackCount(offline);
    } finally { setRunNote(""); setLoading(false); }
  }

  // ---------- Ask your own question ----------
  async function askCustom() {
    const qt = customQuestion.trim();
    if (!qt || askLoading || !results) return;
    setAskLoading(true); setAskInfo(null);
    const newId = Math.max(...questions.map((q) => q.id)) + 1;

    const prompt = `You are an AI assistant inside a third-party risk review platform. A vendor has provided a security policy document. Answer the question below using ONLY information found in the document. Never assume anything that is not stated.

DOCUMENT:
"""
${docText.slice(0, 12000)}
"""

QUESTIONNAIRE:
${newId}. ${qt}

${RULES}
The array must contain exactly one object with id ${newId}.`;

    let item = null;
    try {
      const parsed = await callClaude(prompt);
      item = Array.isArray(parsed) ? parsed[0] : parsed;
      if (!item || !item.answer) throw new Error("Bad shape");
    } catch (err) {
      console.error("Ask-AI failed, using keyword-search fallback:", err);
      const related = lexicalLookup(qt, docText);
      item = {
        answer: "Not found", confidence: "Low", evidence: "", related_excerpt: related,
        rationale: related
          ? "Live AI was unreachable - closest matching line found by keyword search; please review."
          : "Live AI was unreachable and keyword search found nothing related; please review.",
        needs_review: true,
      };
      setAskInfo("Live AI could not be reached, so an honest keyword search of the document was used instead - result added below, flagged for your review.");
    }
    item.id = newId;
    setQuestions((qs) => [...qs, { id: newId, text: qt, custom: true }]);
    setResults((rs) => [...rs, item]);
    setCustomQuestion(""); setSearchQ(""); setFilter("all");
    setAskLoading(false);
  }

  // ---------- Derived state ----------
  const resultFor = (q) => results && results.find((x) => x.id === q.id);
  const flaggedQs = results ? questions.filter((q) => resultFor(q) && resultFor(q).needs_review) : [];
  const readyQs = results ? questions.filter((q) => resultFor(q) && !resultFor(q).needs_review) : [];
  const flagged = flaggedQs.length;
  const auto = readyQs.length;
  const total = flagged + auto;
  const verifiedPct = total ? Math.round((auto / total) * 100) : 0;
  const reviewedFlagged = flaggedQs.filter((q) => decisions[q.id]).length;
  const pendingReview = Math.max(flagged - reviewedFlagged, 0);
  const decisionList = Object.values(decisions);
  const resolvedByYou = decisionList.filter((d) => d.type === "approved" || d.type === "edited").length;
  const sentToVendor = decisionList.filter((d) => d.type === "followup").length;
  const allResolved = results && flagged > 0 && reviewedFlagged >= flagged;

  // ---------- Chips ----------
  const answerChip = (a, edited) => {
    const map = { Yes: GREEN, No: RED, Partial: AMBER, "Not found": "#475569" };
    const bg = map[a] || map["Not found"];
    return (
      <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white"
        style={{ background: bg, boxShadow: `0 2px 8px ${bg}55` }}>
        {edited ? "✎ " : ""}{a}
      </span>
    );
  };

  const confChip = (c) => {
    const map = {
      High: ["#065F46", "#D1FAE5", "#10B981"],
      Medium: ["#92400E", "#FEF3C7", "#F59E0B"],
      Low: ["#991B1B", "#FEE2E2", "#EF4444"],
    };
    const [fg, bg, dot] = map[c] || map.Low;
    return (
      <span className="text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5"
        style={{ color: fg, background: bg, border: `1.5px solid ${dot}` }}>
        <span className="w-2 h-2 rounded-full inline-block" style={{ background: dot }} />
        {c} confidence
      </span>
    );
  };

  function openFollowup(q, r) {
    const t = buildFollowup(q, r);
    setFuChannel("email"); setFuSubject(t.subject); setFuBody(t.body); setFuChat(t.chat);
    setActiveAction({ id: q.id, type: "followup" });
  }

  function openEdit(q, r, decision) {
    setEditAnswer((decision && decision.newAnswer) || r.answer === "Not found" ? "Yes" : r.answer);
    setDraft((decision && decision.note) || "");
    setActiveAction({ id: q.id, type: "edit" });
  }

  function jumpToHighlight(id) {
    const el = document.getElementById("hl-q" + id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setFlashId(id);
      setTimeout(() => setFlashId(null), 1600);
    } else if (mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // ---------- Card ----------
  function renderCard(q, idx) {
    const r = resultFor(q);
    if (!r) return null;
    const decision = decisions[q.id];
    const isOpenFlag = r.needs_review && !decision;
    const isActive = activeAction && activeAction.id === q.id;
    const isCustom = !!q.custom;
    const shownAnswer = (decision && decision.newAnswer) || r.answer;
    const loc = findLocation(r.evidence || r.related_excerpt, docText, pages);
    const locLabel = loc ? (loc.page ? `Page ${loc.page} · Line ${loc.line || "?"}` : `Line ${loc.line}`) : null;

    const stripFor = (d) => {
      if (d.type === "approved") return { bg: "#E5F6F1", fg: TEAL, label: "✓ REVIEWED - APPROVED" };
      if (d.type === "edited") return { bg: "#F0EBFB", fg: VIOLET, label: "✎ ANSWER WRITTEN BY YOU" };
      return { bg: "#EDEDFB", fg: INDIGO_DK, label: d.channel === "chat" ? "💬 FOLLOW-UP SENT VIA CHAT" : "✉ FOLLOW-UP SENT VIA EMAIL" };
    };

    const borderLeft = decision
      ? `5px solid ${decision.type === "approved" ? TEAL : decision.type === "edited" ? VIOLET : INDIGO}`
      : r.needs_review ? `5px solid ${RED}` : "5px solid #A7E3D2";

    return (
      <div key={q.id} id={"card-q" + q.id} className="pp-card bg-white rounded-2xl p-5"
        style={{
          border: isOpenFlag ? "1px solid #F5B5B0" : "1px solid #E6E8EE",
          borderLeft,
          boxShadow: isOpenFlag ? "0 8px 26px rgba(220,38,38,.10)" : "0 4px 16px rgba(26,31,54,.04)",
          animation: `ppFadeUp .5s ${Math.min(idx * 0.06, 0.5)}s ease both`,
        }}>

        {isOpenFlag && (
          <div className="-mx-5 -mt-5 mb-4 px-5 py-2.5 rounded-t-2xl flex items-center gap-2" style={{ background: "#FEE9E7" }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: RED, animation: "ppPulseDot 1.3s ease-in-out infinite" }} />
            <span className="text-xs font-extrabold" style={{ color: RED, letterSpacing: ".07em" }}>NEEDS YOUR REVIEW</span>
          </div>
        )}
        {decision && (
          <div className="-mx-5 -mt-5 mb-4 px-5 py-2.5 rounded-t-2xl flex items-center gap-2" style={{ background: stripFor(decision).bg }}>
            <span className="text-xs font-extrabold" style={{ color: stripFor(decision).fg, letterSpacing: ".07em" }}>{stripFor(decision).label}</span>
            <button onClick={() => { const d = { ...decisions }; delete d[q.id]; setDecisions(d); }}
              className="ml-auto text-xs font-semibold underline" style={{ color: "#7A8094" }}>
              change
            </button>
          </div>
        )}

        <div className="flex items-start justify-between gap-3 flex-wrap">
          <p className="text-sm font-semibold flex-1 m-0 leading-relaxed" style={{ minWidth: 180, color: INK }}>
            <span className="inline-flex w-5 h-5 rounded-md items-center justify-center text-xs font-bold mr-2 align-middle" style={{ background: "#EEF0F5", color: "#5A6072" }}>{q.id}</span>
            {q.text}
            {q.cat && (
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full align-middle" style={{ background: "#F1F2F6", color: "#7A8094" }}>{q.cat}</span>
            )}
            {isCustom && (
              <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full align-middle" style={{ background: "#EDEDFB", color: INDIGO_DK }}>✨ your question</span>
            )}
          </p>
          <div className="flex gap-2 items-center flex-wrap">{answerChip(shownAnswer, decision && decision.type === "edited")}{confChip(r.confidence)}</div>
        </div>

        {/* Multi-part breakdown */}
        {r.parts && r.parts.length > 1 && (
          <div className="mt-3 rounded-xl p-3" style={{ background: "#F7F8FB", border: "1px solid #E6E8EE" }}>
            <p className="text-xs font-bold m-0 mb-2" style={{ color: "#3A4154" }}>This question has {r.parts.length} parts - here is each one:</p>
            <div className="space-y-1.5">
              {r.parts.map((p) => {
                const st = p.status === "Confirmed"
                  ? { icon: "✔", fg: GREEN, bg: "#E5F6F1" }
                  : p.status === "Partially covered"
                    ? { icon: "◐", fg: AMBER, bg: "#FEF6E7" }
                    : { icon: "✖", fg: RED, bg: "#FEE9E7" };
                return (
                  <div key={p.item} className="flex items-center gap-2 text-xs font-semibold rounded-lg px-2.5 py-1.5" style={{ background: st.bg, color: st.fg }}>
                    <span>{st.icon}</span>
                    <span style={{ color: INK }}>{p.item}</span>
                    <span className="ml-auto">{p.status === "Not mentioned" ? "Not mentioned in the document" : p.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {r.evidence ? (
          <div className="mt-3.5 rounded-xl overflow-hidden" style={{ background: "#E9F6F1", border: "1px solid #BBE4D4" }}>
            <div className="px-3.5 pt-2.5 pb-1.5 flex items-center gap-2 flex-wrap">
              <span style={{ fontSize: 11 }}>📎</span>
              <span className="text-xs font-extrabold" style={{ color: "#0B6B5D", letterSpacing: ".05em" }}>
                PROOF - EXACT LINE FROM THE VENDOR'S DOCUMENT
              </span>
              {locLabel && (
                <button onClick={() => jumpToHighlight(q.id)}
                  className="pp-chipbtn ml-auto text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "#fff", color: TEAL, border: `1.5px solid ${TEAL}` }}>
                  📍 {locLabel} - view in document
                </button>
              )}
            </div>
            <div className="mx-2 mb-2 bg-white rounded-lg px-3.5 py-3" style={{ border: "1px solid #D6EEE3" }}>
              <p className="text-sm leading-relaxed m-0 font-medium" style={{ color: "#111827" }}>
                <span style={{ color: TEAL, fontWeight: 800, fontSize: 16, marginRight: 3 }}>“</span>
                {r.evidence}
                <span style={{ color: TEAL, fontWeight: 800, fontSize: 16, marginLeft: 3 }}>”</span>
              </p>
            </div>
          </div>
        ) : r.related_excerpt ? (
          <div className="mt-3.5 rounded-xl overflow-hidden" style={{ background: "#FEF6E7", border: "1px solid #F2D9A6" }}>
            <div className="px-3.5 pt-2.5 pb-1.5 flex items-center gap-2 flex-wrap">
              <span style={{ fontSize: 11 }}>🔎</span>
              <span className="text-xs font-extrabold" style={{ color: "#92400E", letterSpacing: ".05em" }}>
                CLOSEST RELATED LINE - NOT A DIRECT ANSWER
              </span>
              {locLabel && (
                <button onClick={() => jumpToHighlight(q.id)}
                  className="pp-chipbtn ml-auto text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "#fff", color: AMBER, border: `1.5px solid ${AMBER}` }}>
                  📍 {locLabel} - view in document
                </button>
              )}
            </div>
            <div className="mx-2 bg-white rounded-lg px-3.5 py-3" style={{ border: "1px solid #F2E3C4" }}>
              <p className="text-sm leading-relaxed m-0 font-medium" style={{ color: "#111827" }}>
                <span style={{ color: AMBER, fontWeight: 800, fontSize: 16, marginRight: 3 }}>“</span>
                {r.related_excerpt}
                <span style={{ color: AMBER, fontWeight: 800, fontSize: 16, marginLeft: 3 }}>”</span>
              </p>
            </div>
            <p className="px-3.5 py-2.5 text-xs m-0 font-medium" style={{ color: "#92400E" }}>
              The document does not directly answer this - above is the nearest related text, shown for context only.
            </p>
          </div>
        ) : (
          <div className="mt-3.5 rounded-xl px-4 py-3 text-xs font-medium" style={{ background: "#F4F4F6", color: "#3A4154", borderLeft: "3px solid #C9CCD6" }}>
            Nothing in the document answers or even relates to this - the AI does not guess, so this comes to you.
          </div>
        )}

        {(() => {
          const hasParts = r.parts && r.parts.length > 1;
          const findings = !hasParts ? splitFindings(r.rationale) : null;
          if (!findings) {
            return <p className="mt-2.5 text-xs m-0 leading-relaxed" style={{ color: "#5A6072" }}>{r.rationale}</p>;
          }
          return (
            <div className="mt-3 rounded-xl p-3" style={{ background: "#F7F8FB", border: "1px solid #E6E8EE" }}>
              <p className="text-xs font-bold m-0 mb-2" style={{ color: "#3A4154" }}>This answer has mixed findings - each one shown separately:</p>
              <div className="space-y-1.5">
                {findings.map((f, i) => {
                  const st = f.status === "pos"
                    ? { icon: "✔", fg: GREEN, bg: "#E5F6F1" }
                    : f.status === "part"
                      ? { icon: "◐", fg: AMBER, bg: "#FEF6E7" }
                      : { icon: "✖", fg: RED, bg: "#FEE9E7" };
                  return (
                    <div key={i} className="flex items-start gap-2 text-xs font-semibold rounded-lg px-2.5 py-1.5" style={{ background: st.bg }}>
                      <span style={{ color: st.fg }}>{st.icon}</span>
                      <span style={{ color: INK }}>{f.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {decision && decision.note && (
          <div className="mt-3 rounded-lg px-3.5 py-2.5 text-xs leading-relaxed" style={{ background: "#F7F8FB", border: "1px solid #E6E8EE" }}>
            <span className="font-bold" style={{ color: "#5A6072" }}>
              {decision.type === "followup" ? "Message sent: " : decision.type === "edited" ? "Your answer: " : "Your note: "}
            </span>
            <span style={{ color: "#3A4154", whiteSpace: "pre-wrap" }}>{decision.note}</span>
          </div>
        )}

        {/* Action area */}
        {!decision && (
          <div className="mt-4 pt-3.5" style={{ borderTop: "1px dashed #E6E8EE" }}>
            {!isActive ? (
              <div className="flex gap-2 flex-wrap">
                {r.needs_review && (
                  <button onClick={() => { setActiveAction({ id: q.id, type: "approve" }); setDraft(""); }}
                    className="pp-chipbtn text-xs font-bold px-4 py-2 rounded-lg"
                    style={{ background: "#fff", color: TEAL, border: `1.5px solid ${TEAL}` }}>
                    ✓ Approve answer
                  </button>
                )}
                <button onClick={() => openEdit(q, r, decision)}
                  className="pp-chipbtn text-xs font-bold px-4 py-2 rounded-lg"
                  style={{ background: "#fff", color: VIOLET, border: `1.5px solid ${VIOLET}` }}>
                  ✎ Write my own answer
                </button>
                {r.needs_review && (
                  <button onClick={() => openFollowup(q, r)}
                    className="pp-chipbtn text-xs font-bold px-4 py-2 rounded-lg"
                    style={{ background: "#fff", color: INDIGO_DK, border: `1.5px solid ${INDIGO}` }}>
                    ✉ Ask vendor follow-up
                  </button>
                )}
              </div>
            ) : activeAction.type === "approve" ? (
              <div style={{ animation: "ppFadeUp .25s ease both" }}>
                <label className="text-xs font-bold block mb-1.5" style={{ color: "#3A4154" }}>
                  Your note - what did you check or change? (optional)
                </label>
                <textarea value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus
                  placeholder="e.g. Verified against their SOC 2 report shared over email."
                  className="w-full text-xs p-3 rounded-lg leading-relaxed outline-none"
                  style={{ border: "1.5px solid #D5D8E0", background: "#FCFCFD", height: 72, resize: "vertical" }} />
                <div className="flex gap-2 mt-2 flex-wrap">
                  <button onClick={() => { setDecisions({ ...decisions, [q.id]: { type: "approved", note: draft.trim() } }); setActiveAction(null); setDraft(""); }}
                    className="pp-btn text-xs font-bold px-4 py-2 rounded-lg text-white" style={{ background: TEAL }}>
                    Confirm approval
                  </button>
                  <button onClick={() => { setActiveAction(null); setDraft(""); }} className="text-xs font-semibold px-3 py-2" style={{ color: "#7A8094" }}>Cancel</button>
                </div>
              </div>
            ) : activeAction.type === "edit" ? (
              <div style={{ animation: "ppFadeUp .25s ease both" }}>
                <label className="text-xs font-bold block mb-1.5" style={{ color: "#3A4154" }}>Pick the answer you believe is correct:</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {["Yes", "No", "Partial", "Not found"].map((a) => (
                    <button key={a} onClick={() => setEditAnswer(a)}
                      className="pp-chipbtn text-xs font-bold px-3.5 py-1.5 rounded-full"
                      style={editAnswer === a
                        ? { background: VIOLET, color: "#fff", border: `1.5px solid ${VIOLET}` }
                        : { background: "#fff", color: "#3A4154", border: "1.5px solid #DDE0E8" }}>
                      {a}
                    </button>
                  ))}
                </div>
                <textarea value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus
                  placeholder="Write your answer or correction here - this becomes part of the audit trail."
                  className="w-full text-xs p-3 rounded-lg leading-relaxed outline-none"
                  style={{ border: "1.5px solid #D5D8E0", background: "#FCFCFD", height: 76, resize: "vertical" }} />
                <div className="flex gap-2 mt-2 flex-wrap">
                  <button onClick={() => { setDecisions({ ...decisions, [q.id]: { type: "edited", newAnswer: editAnswer, note: draft.trim() } }); setActiveAction(null); setDraft(""); }}
                    className="pp-btn text-xs font-bold px-4 py-2 rounded-lg text-white" style={{ background: VIOLET }}>
                    Save my answer
                  </button>
                  <button onClick={() => { setActiveAction(null); setDraft(""); }} className="text-xs font-semibold px-3 py-2" style={{ color: "#7A8094" }}>Cancel</button>
                </div>
              </div>
            ) : (
              /* ---------- Follow-up composer: Email / Chat ---------- */
              <div style={{ animation: "ppFadeUp .25s ease both" }}>
                <div className="flex gap-2 mb-3">
                  {[["email", "📧 Send a formal email"], ["chat", "💬 Send via chat"]].map(([k, label]) => (
                    <button key={k} onClick={() => setFuChannel(k)}
                      className="pp-chipbtn text-xs font-bold px-3.5 py-2 rounded-lg"
                      style={fuChannel === k
                        ? { background: INDIGO, color: "#fff", border: `1.5px solid ${INDIGO}` }
                        : { background: "#fff", color: "#3A4154", border: "1.5px solid #DDE0E8" }}>
                      {label}
                    </button>
                  ))}
                </div>

                {fuChannel === "email" ? (
                  <div className="rounded-xl p-3" style={{ background: "#F7F8FB", border: "1px solid #E6E8EE" }}>
                    <label className="text-xs font-bold block mb-1" style={{ color: "#3A4154" }}>Subject</label>
                    <input value={fuSubject} onChange={(e) => setFuSubject(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg outline-none mb-2"
                      style={{ border: "1.5px solid #D5D8E0", background: "#fff", color: INK }} />
                    <label className="text-xs font-bold block mb-1" style={{ color: "#3A4154" }}>Message (already written for you - edit if you like)</label>
                    <textarea value={fuBody} onChange={(e) => setFuBody(e.target.value)}
                      className="w-full text-xs p-3 rounded-lg leading-relaxed outline-none"
                      style={{ border: "1.5px solid #D5D8E0", background: "#fff", height: 190, resize: "vertical", color: INK }} />
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <a href={"mailto:?subject=" + encodeURIComponent(fuSubject) + "&body=" + encodeURIComponent(fuBody)}
                        className="pp-btn text-xs font-bold px-4 py-2 rounded-lg text-white inline-block" style={{ background: INDIGO, textDecoration: "none" }}>
                        Open in mail app
                      </a>
                      <button onClick={() => copyText("Subject: " + fuSubject + "\n\n" + fuBody, "em" + q.id)}
                        className="pp-chipbtn text-xs font-bold px-4 py-2 rounded-lg" style={{ background: "#fff", color: INK, border: "1.5px solid #DDE0E8" }}>
                        {copiedKey === "em" + q.id ? "Copied ✓" : "Copy email"}
                      </button>
                      <button onClick={() => { setDecisions({ ...decisions, [q.id]: { type: "followup", channel: "email", note: "Subject: " + fuSubject + "\n" + fuBody } }); setActiveAction(null); }}
                        className="pp-btn text-xs font-bold px-4 py-2 rounded-lg text-white" style={{ background: TEAL }}>
                        Mark as sent
                      </button>
                      <button onClick={() => setActiveAction(null)} className="text-xs font-semibold px-2 py-2" style={{ color: "#7A8094" }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl p-3" style={{ background: "#F7F8FB", border: "1px solid #E6E8EE" }}>
                    <label className="text-xs font-bold block mb-1" style={{ color: "#3A4154" }}>Chat message (already written for you - edit if you like)</label>
                    <textarea value={fuChat} onChange={(e) => setFuChat(e.target.value)}
                      className="w-full text-xs p-3 rounded-lg leading-relaxed outline-none"
                      style={{ border: "1.5px solid #D5D8E0", background: "#fff", height: 110, resize: "vertical", color: INK }} />
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <button onClick={() => copyText(fuChat, "ch" + q.id)}
                        className="pp-chipbtn text-xs font-bold px-4 py-2 rounded-lg" style={{ background: "#fff", color: INK, border: "1.5px solid #DDE0E8" }}>
                        {copiedKey === "ch" + q.id ? "Copied ✓" : "Copy message"}
                      </button>
                      <button onClick={() => { setDecisions({ ...decisions, [q.id]: { type: "followup", channel: "chat", note: fuChat } }); setActiveAction(null); }}
                        className="pp-btn text-xs font-bold px-4 py-2 rounded-lg text-white" style={{ background: TEAL }}>
                        Mark as sent
                      </button>
                      <button onClick={() => setActiveAction(null)} className="text-xs font-semibold px-2 py-2" style={{ color: "#7A8094" }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {decision && (
          <div className="mt-3">
            <button onClick={() => openEdit(q, resultFor(q), decision)}
              className="text-xs font-semibold underline" style={{ color: VIOLET }}>
              ✎ Edit my answer
            </button>
          </div>
        )}
      </div>
    );
  }

  // ---------- Filters + groups ----------
  const term = searchQ.trim().toLowerCase();
  const matches = (q) => {
    const r = resultFor(q);
    if (!r) return false;
    const d = decisions[q.id];
    const finalAns = (d && d.newAnswer) || r.answer;
    if (term && !q.text.toLowerCase().includes(term)) return false;
    if (ansFilter !== "all" && finalAns !== ansFilter) return false;
    if (confFilter !== "all" && r.confidence !== confFilter) return false;
    if (decisionFilter !== "all") {
      if (decisionFilter === "pending") { if (d || !r.needs_review) return false; }
      else if (!d || d.type !== decisionFilter) return false;
    }
    return true;
  };
  const groups = [];
  if (results) {
    if (filter !== "ready") groups.push({ key: "flagged", title: "Needs your review", color: RED, items: flaggedQs.filter(matches), total: flagged });
    if (filter !== "flagged") groups.push({ key: "ready", title: "Verified - proof attached", color: GREEN, items: readyQs.filter(matches), total: auto });
  }
  let cardIdx = 0;

  // ---------- Answer Map data ----------
  const mapItems = results
    ? questions.map((q) => {
        const r = resultFor(q);
        if (!r) return null;
        const quote = r.evidence || r.related_excerpt;
        if (!quote) return null;
        return { qid: q.id, question: q.text, quote, kind: r.evidence ? "proof" : "rel" };
      }).filter(Boolean)
    : [];
  const highlights = results ? buildHighlights(docText, mapItems) : [];

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #F6F7FF 0%, #F2FBF7 100%)", fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif", color: INK }}>
      <style>{GLOBAL_CSS}</style>

      {/* ============ HERO ============ */}
      <header className="relative overflow-hidden"
        style={{ background: "linear-gradient(115deg, #5B5BD6 0%, #7C5CE0 38%, #2BA58E 78%, #11B395 100%)", backgroundSize: "200% 200%", animation: "ppGradient 14s ease infinite" }}>
        <div className="absolute rounded-full" style={{ width: 320, height: 320, background: "rgba(255,255,255,.14)", filter: "blur(60px)", top: -120, right: -60, animation: "ppDrift 9s ease-in-out infinite" }} />
        <div className="absolute rounded-full" style={{ width: 240, height: 240, background: "rgba(255,255,255,.10)", filter: "blur(50px)", bottom: -100, left: "12%", animation: "ppDrift 11s ease-in-out infinite reverse" }} />

        <div className="max-w-6xl mx-auto px-5 md:px-8 pt-8 pb-10 relative">
          <div className="flex items-center justify-between flex-wrap gap-3" style={{ animation: "ppFadeDown .6s ease both" }}>
            <div className="flex items-center gap-2.5">
              <Logo />
              <span className="text-white font-bold tracking-tight" style={{ fontSize: 19 }}>
                Proof<span style={{ color: "#CFFAEC" }}>Pilot</span>
              </span>
            </div>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ color: "#fff", border: "1px solid rgba(255,255,255,.4)", background: "rgba(255,255,255,.14)" }}>
              Third-party risk · AI on your terms
            </span>
          </div>

          <div className="mt-9 max-w-3xl" style={{ animation: "ppFadeUp .7s .12s ease both" }}>
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              AI fills the answers.<br />
              <span style={{ color: "#CFFAEC" }}>Proof seals the trust.</span>
            </h1>
            <p className="mt-4 text-base md:text-lg leading-relaxed" style={{ color: "rgba(255,255,255,.88)" }}>
              Onboard vendors 3x faster - every answer arrives with the exact line from their own document,
              a confidence score, and a clear flag whenever a human should decide.
            </p>
          </div>

          <div className="mt-8 flex items-center gap-2 md:gap-3 flex-wrap" style={{ animation: "ppFadeUp .7s .25s ease both" }}>
            {["Add the vendor's document", "AI fills answers with proof", "You review what's flagged", "Sign off, audit-ready"].map((s, i) => (
              <div key={s} className="flex items-center gap-2 md:gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ color: "#fff", background: "rgba(255,255,255,.16)", border: "1px solid rgba(255,255,255,.32)" }}>
                  <span className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,.95)", color: INDIGO_DK, fontSize: 9, fontWeight: 800 }}>{i + 1}</span>
                  {s}
                </div>
                {i < 3 && <span style={{ color: "rgba(255,255,255,.6)" }}>→</span>}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 md:px-8 py-9 grid gap-8 lg:grid-cols-12">
        {/* ============ LEFT: DOCUMENT ============ */}
        <section className="lg:col-span-5" style={{ animation: "ppFadeUp .6s .35s ease both" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold px-2 py-0.5 rounded text-white" style={{ background: INDIGO }}>STEP 1</span>
            <h2 className="text-sm font-bold tracking-wide" style={{ color: "#5A6072" }}>THE VENDOR'S DOCUMENT</h2>
          </div>

          <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E6E8EE", boxShadow: "0 6px 24px rgba(26,31,54,.05)" }}>
            <div className="flex gap-2 flex-wrap mb-4">
              {[["mature", SAMPLE_DOCS.mature.label], ["early", SAMPLE_DOCS.early.label], ["custom", "My own document"]].map(([k, label]) => (
                <button key={k} onClick={() => { setDocKey(k); resetAll(); setFileInfo(null); setFileError(null); setFilePages(null); }}
                  className="pp-chipbtn text-xs font-semibold px-3.5 py-2 rounded-full"
                  style={docKey === k
                    ? { background: INDIGO, color: "#fff", border: `1px solid ${INDIGO}` }
                    : { background: "#fff", color: "#3A4154", border: "1px solid #DDE0E8" }}>
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="text-xs font-bold" style={{ color: "#5A6072" }}>Questionnaire:</span>
              {[["starter", "Starter - 8 questions"], ["full", "Full review - 30 questions"]].map(([k, label]) => (
                <button key={k}
                  onClick={() => {
                    setQSetKey(k);
                    setQuestions(k === "full" ? FULL_QUESTIONS : STARTER_QUESTIONS);
                    setResults(null); setDecisions({}); setSearchQ("");
                    setFilter("all"); setAnsFilter("all"); setConfFilter("all"); setDecisionFilter("all");
                    setActiveAction(null); setAskInfo(null);
                  }}
                  className="pp-chipbtn text-xs font-bold px-3.5 py-1.5 rounded-full"
                  style={qSetKey === k
                    ? { background: INK, color: "#fff", border: `1px solid ${INK}` }
                    : { background: "#fff", color: "#3A4154", border: "1px solid #DDE0E8" }}>
                  {label}
                </button>
              ))}
            </div>

            {docKey === "custom" && (
              <div className="mb-3">
                <label className="pp-chipbtn flex items-center justify-center gap-2 w-full rounded-xl px-4 py-3.5 cursor-pointer text-sm font-bold"
                  style={{ border: "1.5px dashed #B9BECC", background: "#FAFBFC", color: "#3A4154" }}>
                  <span style={{ fontSize: 16 }}>📄</span>
                  {parsing ? "Extracting text…" : "Upload PDF / Word (.docx) / TXT"}
                  <input type="file" accept=".pdf,.docx,.txt,.md" className="hidden" onChange={handleFile} disabled={parsing} />
                </label>
                {fileInfo && (
                  <div className="flex items-center gap-2 mt-2 text-xs font-semibold flex-wrap" style={{ color: TEAL, animation: "ppFadeUp .3s ease both" }}>
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-white" style={{ background: TEAL, fontSize: 9 }}>✓</span>
                    {fileInfo.name} · {fileInfo.chars.toLocaleString()} characters{fileInfo.pages ? ` · ${fileInfo.pages} pages` : ""}
                    <button onClick={() => { setFileInfo(null); setCustomText(""); setFilePages(null); }} className="underline font-semibold" style={{ color: "#7A8094" }}>remove</button>
                  </div>
                )}
                {fileError && (
                  <div className="mt-2 text-xs font-medium px-3 py-2.5 rounded-lg" style={{ background: "#FEE9E7", color: RED }}>{fileError}</div>
                )}
              </div>
            )}

            <div className="relative rounded-xl overflow-hidden" style={{ border: "1px solid #E6E8EE" }}>
              {docKey === "custom" ? (
                <textarea value={customText} onChange={(e) => { setCustomText(e.target.value); setFileInfo(null); setFilePages(null); }}
                  placeholder="…or paste any security policy, SOC 2 summary, or trust-center text here"
                  className="w-full p-4 text-xs leading-relaxed outline-none"
                  style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", background: "#FCFCFD", resize: "vertical", height: 230 }} />
              ) : (
                <div className="overflow-y-auto p-4 text-xs leading-relaxed whitespace-pre-wrap" style={{ background: "#FCFCFD", color: "#3A4154", height: 288 }}>
                  {SAMPLE_DOCS[docKey].text}
                </div>
              )}
              {loading && (
                <>
                  <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(91,91,214,.05), rgba(17,179,149,.05))" }} />
                  <div className="absolute left-0 right-0" style={{ height: 3, background: `linear-gradient(90deg, transparent, ${INDIGO}, #11B395, transparent)`, boxShadow: `0 0 16px ${INDIGO}`, animation: "ppScan 1.8s ease-in-out infinite" }} />
                </>
              )}
            </div>

            <button onClick={runPrefill} disabled={loading || parsing}
              className="pp-btn mt-4 w-full rounded-xl px-4 py-3.5 text-sm font-bold text-white"
              style={{ background: loading ? "#9A9AB8" : "linear-gradient(115deg, #5B5BD6, #7C5CE0 55%, #11B395)", boxShadow: loading ? "none" : "0 8px 22px rgba(91,91,214,.4)" }}>
              {loading ? "Reading the document…" : "Auto-Fill Answers →"}
            </button>

            {loading && (
              <div className="mt-4 space-y-2.5" style={{ animation: "ppFadeUp .3s ease both" }}>
                {PHASES.map((p, i) => (
                  <div key={p} className="flex items-center gap-2.5 text-xs" style={{ color: i <= phase ? INK : "#9AA0B0", transition: "color .3s" }}>
                    {i < phase ? (
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-white" style={{ background: TEAL, fontSize: 9, animation: "ppPop .3s ease both" }}>✓</span>
                    ) : i === phase ? (
                      <span className="w-4 h-4 rounded-full" style={{ background: INDIGO, animation: "ppPulseDot 1s ease-in-out infinite" }} />
                    ) : (
                      <span className="w-4 h-4 rounded-full" style={{ border: "1.5px solid #D5D8E0" }} />
                    )}
                    <span className={i === phase ? "font-semibold" : ""}>{p}</span>
                  </div>
                ))}
                {runNote && (
                  <p className="text-xs font-bold m-0 pt-1" style={{ color: INDIGO_DK }}>{runNote}</p>
                )}
              </div>
            )}

            {error && <div className="mt-3 text-xs font-medium px-3 py-2.5 rounded-lg" style={{ background: "#FEE9E7", color: RED }}>{error}</div>}

            <p className="text-xs mt-4 leading-relaxed" style={{ color: "#7A8094" }}>
              <span className="font-semibold" style={{ color: INK }}>How it decides:</span> exact answer → exact line as proof. Only related text → "closest related line", clearly marked. Nothing → "Not found" + your review. The AI never guesses.
            </p>
          </div>
        </section>

        {/* ============ RIGHT: ANSWERS ============ */}
        <section className="lg:col-span-7" ref={resultsRef}>
          <div className="flex items-center gap-2 mb-3 flex-wrap" style={{ animation: "ppFadeUp .6s .45s ease both" }}>
            <span className="text-xs font-bold px-2 py-0.5 rounded text-white" style={{ background: INDIGO }}>STEP 2</span>
            <h2 className="text-sm font-bold tracking-wide" style={{ color: "#5A6072" }}>ANSWERS, FILLED WITH PROOF</h2>
            <button onClick={() => setShowQInfo((v) => !v)}
              className="pp-chipbtn inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: "#fff", color: INDIGO_DK, border: `1.5px solid ${INDIGO}`, boxShadow: "0 3px 10px rgba(91,91,214,.20)" }}>
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${INDIGO}, #11B395)`, fontSize: 10, fontStyle: "italic", fontFamily: "Georgia, serif" }}>i</span>
              About these questions
              <span style={{ fontSize: 8 }}>{showQInfo ? "▲" : "▼"}</span>
            </button>
          </div>

          {showQInfo && (
            <div className="rounded-xl px-4 py-3 mb-4 text-xs leading-relaxed" style={{ background: "#fff", border: "1.5px solid #D8DAF5", boxShadow: "0 10px 28px rgba(91,91,214,.14)", color: "#3A4154", animation: "ppFadeUp .25s ease both" }}>
              <span className="font-bold" style={{ color: INDIGO_DK }}>Where do these questions come from? </span>
              They are a representative set modeled on standard industry security questionnaires such as SIG (Shared Assessments) and CAIQ (Cloud Security Alliance), covering ten control areas: data protection, access control, incident response, security testing, compliance, vendor management, data lifecycle, business continuity and people security. The engine itself is questionnaire-agnostic - bring any template and it answers from the document with proof.
              <button onClick={() => setShowQInfo(false)} className="ml-2 font-bold underline" style={{ color: "#7A8094" }}>close</button>
            </div>
          )}

          {!results && !loading && (
            <div className="rounded-2xl p-12 text-center bg-white" style={{ border: "1.5px dashed #D5D8E0", animation: "ppFadeUp .6s .5s ease both" }}>
              <div className="text-3xl mb-3" style={{ animation: "ppFloat 3s ease-in-out infinite" }}>🧭</div>
              <p className="text-sm font-bold" style={{ color: INK }}>Your answers will appear here</p>
              <p className="text-xs mt-1.5 max-w-sm mx-auto" style={{ color: "#7A8094" }}>
                Pick a vendor document and press Auto-Fill. Anything that needs your review always appears first.
              </p>
            </div>
          )}

          {loading && (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl h-24 bg-white" style={{
                  border: "1px solid #E6E8EE",
                  backgroundImage: "linear-gradient(90deg, #fff 0%, #F1F2F6 40%, #fff 80%)",
                  backgroundSize: "960px 100%", animation: `ppShimmer 1.4s ${i * 0.12}s linear infinite`,
                }} />
              ))}
            </div>
          )}

          {results && (
            <div>
              {fallbackCount > 0 && (
                <div className="text-xs px-4 py-3 rounded-xl mb-4 font-medium" style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #F59E0B44", animation: "ppFadeUp .4s ease both" }}>
                  {docKey === "mature"
                    ? `Demo mode: ${fallbackCount === total ? "live AI is not connected here, so the pre-computed sample run is shown" : `${fallbackCount} of ${total} answers come from the pre-computed sample run`} - every feature still works.`
                    : `Live AI could not answer ${fallbackCount} of ${total} questions just now - those show the closest matching line from your document (keyword search) and are flagged for your review. Run again, or use the live environment, for verified answers with proof.`}
                </div>
              )}

              {/* Summary panel */}
              <div className="rounded-2xl p-5 md:p-6 mb-5 flex items-center gap-6 flex-wrap relative overflow-hidden"
                style={{ background: "linear-gradient(125deg, #5B5BD6 0%, #7C5CE0 45%, #11B395 100%)", backgroundSize: "180% 180%", animation: "ppGradient 12s ease infinite, ppScaleIn .5s ease both", boxShadow: "0 14px 36px rgba(91,91,214,.30)" }}>
                <TrustRing pct={verifiedPct} />
                <div className="flex-1 grid grid-cols-2 gap-3" style={{ minWidth: 240 }}>
                  <StatTile value={auto} label="Verified with proof" run={!!results} />
                  <StatTile value={pendingReview} label="Awaiting your review" run={!!results} />
                  <StatTile value={resolvedByYou} label="Approved / written by you" run={!!results} />
                  <StatTile value={sentToVendor} label="Sent to vendor for clarification" run={!!results} />
                </div>
                <p className="w-full text-xs leading-relaxed m-0" style={{ color: "rgba(255,255,255,.9)" }}>
                  Trust is measured, not assumed - the share of high-confidence answers you overturn is the guardrail that decides how much the AI is allowed to automate.
                </p>
              </div>

              {allResolved && (
                <div className="rounded-2xl px-5 py-4 mb-5 flex items-center gap-4 flex-wrap relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${TEAL}, #34D399)`, boxShadow: "0 10px 28px rgba(14,128,116,.35)", animation: "ppScaleIn .45s ease both" }}>
                  {CONFETTI.map((c, i) => (
                    <span key={i} className="absolute rounded-sm" style={{ left: c.l, top: -6, width: 7, height: 11, background: c.c, animation: `ppConfetti ${c.t} ${c.d} ease-in both` }} />
                  ))}
                  <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-lg" style={{ animation: "ppPop .5s .15s ease both" }}>✅</span>
                  <div className="flex-1" style={{ minWidth: 200 }}>
                    <p className="text-sm font-bold text-white m-0">All set - ready for sign-off</p>
                    <p className="text-xs m-0 mt-0.5" style={{ color: "rgba(255,255,255,.92)" }}>
                      {auto} verified with proof · {resolvedByYou} approved or written by you · {sentToVendor} sent to the vendor - full decision trail saved for audit.
                    </p>
                  </div>
                </div>
              )}

              {/* Search */}
              <div className="flex gap-2 mb-3 flex-wrap items-center">
                <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2.5 flex-1" style={{ border: "1.5px solid #DDE0E8", minWidth: 200 }}>
                  <span style={{ fontSize: 13, opacity: .55 }}>🔍</span>
                  <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Search questions… e.g. encryption"
                    className="flex-1 text-xs outline-none bg-transparent" style={{ color: INK }} />
                  {searchQ && (
                    <button onClick={() => setSearchQ("")} className="text-xs font-bold" style={{ color: "#9AA0B0" }}>✕</button>
                  )}
                </div>
              </div>

              {/* Filters - every dropdown defaults to All */}
              <div className="flex gap-2 mb-5 flex-wrap items-center">
                <span className="text-xs font-bold" style={{ color: "#5A6072" }}>Filters:</span>
                <FilterSelect label="Status" value={filter} onChange={setFilter}
                  options={[["all", `All (${total})`], ["flagged", `Needs your review (${flagged})`], ["ready", `Verified (${auto})`]]} />
                <FilterSelect label="Answer" value={ansFilter} onChange={setAnsFilter}
                  options={[["all", "All"], ["Yes", "Yes"], ["No", "No"], ["Partial", "Partial"], ["Not found", "Not found"]]} />
                <FilterSelect label="Confidence" value={confFilter} onChange={setConfFilter}
                  options={[["all", "All"], ["High", "High"], ["Medium", "Medium"], ["Low", "Low"]]} />
                <FilterSelect label="Your decision" value={decisionFilter} onChange={setDecisionFilter}
                  options={[["all", "All"], ["pending", "Awaiting review"], ["approved", "Approved"], ["edited", "Written by me"], ["followup", "Follow-up sent"]]} />
                {(filter !== "all" || ansFilter !== "all" || confFilter !== "all" || decisionFilter !== "all" || searchQ) && (
                  <button onClick={() => { setFilter("all"); setAnsFilter("all"); setConfFilter("all"); setDecisionFilter("all"); setSearchQ(""); }}
                    className="text-xs font-bold underline" style={{ color: INDIGO_DK }}>
                    Reset all
                  </button>
                )}
              </div>

              {groups.map((g) => (
                <div key={g.key} className="mb-7">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: g.color }} />
                    <h3 className="text-sm font-bold m-0" style={{ color: INK }}>{g.title}</h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${g.color}1A`, color: g.color }}>
                      {g.items.length === g.total ? g.total : `${g.items.length} of ${g.total}`}
                    </span>
                    <span className="flex-1" style={{ height: 1, background: "#E6E8EE" }} />
                  </div>
                  {g.items.length === 0 ? (
                    <p className="text-xs italic" style={{ color: "#9AA0B0" }}>No questions match the current filters here.</p>
                  ) : (
                    <div className="space-y-4">{g.items.map((q) => renderCard(q, cardIdx++))}</div>
                  )}
                </div>
              ))}

              {/* Ask your own question */}
              <div className="rounded-2xl p-5 mb-4 bg-white" style={{ border: "1.5px solid #C9C9F2", boxShadow: "0 6px 20px rgba(91,91,214,.10)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontSize: 15 }}>✨</span>
                  <h3 className="text-sm font-bold m-0" style={{ color: INK }}>Ask the document your own question</h3>
                </div>
                <p className="text-xs mb-3 leading-relaxed" style={{ color: "#7A8094" }}>
                  Type any question. Exact answer in the document → you get the exact line as proof. Only something related → you see the closest related line, clearly marked. Truly nothing → it says so and flags it for you.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <input value={customQuestion} onChange={(e) => setCustomQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && askCustom()}
                    placeholder='e.g. "Do you have cyber insurance coverage?"'
                    className="flex-1 text-xs px-3.5 py-2.5 rounded-lg outline-none"
                    style={{ border: "1.5px solid #D5D8E0", background: "#FCFCFD", minWidth: 200, color: INK }} />
                  <button onClick={askCustom} disabled={askLoading || !customQuestion.trim()}
                    className="pp-btn text-xs font-bold px-5 py-2.5 rounded-lg text-white"
                    style={{
                      background: askLoading ? "#9A9AB8" : "linear-gradient(115deg, #5B5BD6, #7C5CE0 55%, #11B395)",
                      opacity: !customQuestion.trim() && !askLoading ? 0.5 : 1,
                      boxShadow: askLoading ? "none" : "0 6px 16px rgba(91,91,214,.35)",
                    }}>
                    {askLoading ? "Asking…" : "Ask AI →"}
                  </button>
                </div>
                {askInfo && (
                  <div className="mt-2 text-xs font-medium px-3 py-2 rounded-lg" style={{ background: "#FEF3C7", color: "#92400E" }}>{askInfo}</div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ============ STEP 3: ANSWER MAP ============ */}
        {results && (
          <section className="lg:col-span-12" ref={mapRef} style={{ animation: "ppFadeUp .6s ease both" }}>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs font-bold px-2 py-0.5 rounded text-white" style={{ background: INDIGO }}>STEP 3</span>
              <h2 className="text-sm font-bold tracking-wide" style={{ color: "#5A6072" }}>ANSWER MAP - THE DOCUMENT, HIGHLIGHTED</h2>
              <span className="text-xs" style={{ color: "#7A8094" }}>Hover any highlight to see its question · click a 📍 location chip above to jump here</span>
            </div>
            <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E6E8EE", boxShadow: "0 6px 24px rgba(26,31,54,.05)", background: "#F0F1F6" }}>
              <div className="flex gap-4 mb-3 text-xs font-semibold flex-wrap" style={{ color: "#5A6072" }}>
                <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded inline-block" style={{ background: "rgba(16,185,129,.45)" }} /> Proof of an answer</span>
                <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded inline-block" style={{ background: "rgba(245,158,11,.5)" }} /> Related line (not a direct answer)</span>
                <span className="inline-flex items-center gap-1.5"><span className="text-xs font-bold rounded-full" style={{ background: GREEN, color: "#fff", padding: "1px 8px" }}>Que 3</span> = Question Number</span>
              </div>
              <div className="whitespace-pre-wrap rounded-lg mx-auto" style={{ background: "#FFFFFF", border: "1px solid #E2E4EC", boxShadow: "0 12px 34px rgba(26,31,54,.10)", color: "#1F2430", maxWidth: 820, padding: "34px 42px", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 13, lineHeight: 1.95 }}>
                <div style={{ borderBottom: "1px solid #E6E8EE", marginBottom: 18, paddingBottom: 10, fontFamily: "ui-sans-serif, system-ui, sans-serif", fontSize: 11, color: "#7A8094", fontWeight: 700, letterSpacing: ".04em" }}>
                  📄 {docKey === "custom" ? (fileInfo ? fileInfo.name : "Pasted document") : SAMPLE_DOCS[docKey].label} - with every answer highlighted in place
                </div>
                {(() => {
                  const parts = [];
                  let cursor = 0;
                  highlights.forEach((h, i) => {
                    if (h.start > cursor) parts.push(<span key={"t" + i}>{docText.slice(cursor, h.start)}</span>);
                    parts.push(
                      <span key={"h" + i} id={"hl-q" + h.qid}
                        className={"pp-hl " + (h.kind === "proof" ? "proof" : "rel")}
                        data-q={"Question " + h.qid + ": " + h.question}
                        onClick={() => {
                          const el = document.getElementById("card-q" + h.qid);
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                        }}
                        style={flashId === h.qid ? { animation: "ppFlash 1.4s ease both" } : undefined}>
                        {docText.slice(h.start, h.end)}
                        <span className="font-bold ml-1 rounded-full" style={{ background: h.kind === "proof" ? GREEN : AMBER, color: "#fff", fontSize: 9, padding: "1px 7px", fontFamily: "ui-sans-serif, system-ui, sans-serif", verticalAlign: "middle", whiteSpace: "nowrap" }}>Que {h.qid}</span>
                      </span>
                    );
                    cursor = h.end;
                  });
                  if (cursor < docText.length) parts.push(<span key="tail">{docText.slice(cursor)}</span>);
                  return parts;
                })()}
              </div>
              {highlights.length === 0 && (
                <p className="text-xs italic mt-2" style={{ color: "#9AA0B0" }}>No quotes could be located in the document text yet.</p>
              )}
            </div>
            <p className="text-xs mt-6 mb-2 text-center leading-relaxed" style={{ color: "#9AA0B0" }}>
              Every answer carries its proof, its location, and your decision - <span className="font-semibold" style={{ color: "#5A6072" }}>"AI on your terms."</span>
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
