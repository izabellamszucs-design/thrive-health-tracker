/*
Design philosophy reminder for this file: Organic Modernism with biomorphic wellness-product interface cues. Every screen should feel like a calm trail-like journey: warm ivory surfaces, pine/moss status feedback, contour-line textures, supportive language, asymmetrical card rhythm, and clear back-to-home escape routes.
*/
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Check,
  ChevronDown,
  ClipboardList,
  Download,
  FileText,
  FlagTriangleRight,
  HeartPulse,
  HomeIcon,
  Leaf,
  Pencil,
  Printer,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

type Page = "home" | "metabolic" | "ratio" | "progress" | "records";
type MetabolicValues = {
  triglycerides: string;
  hdl: string;
  glucose: string;
  systolic: string;
  diastolic: string;
  sex: "" | "female" | "male";
  ethnicity: string;
  waist: string;
};
type RatioValues = { triglycerides: string; hdl: string };
type BiomarkerResult = {
  key: string;
  name: string;
  value: string;
  inRange: boolean;
  criteria: string;
  distance: string;
};
type MetabolicResult = { kind: "metabolic"; summary: string; values: MetabolicValues; biomarkers: BiomarkerResult[]; healthyCount: number };
type RatioResult = { kind: "ratio"; ratio: number; values: RatioValues; status: string; tone: "red" | "yellow" | "lightGreen" | "green"; details?: string[] };
type AssessmentRecord = {
  id: string;
  type: "metabolic" | "ratio";
  title?: string;
  date: string;
  notes: string;
  result: MetabolicResult | RatioResult;
  createdAt: string;
};

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663631608757/62T9izBEw7heJyep2JBp6S/thrive-hero-botanical-dashboard-Mmdqvj8ERSVwJtuGtFMQ8s.webp";
const CARD_TEXTURE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663631608757/62T9izBEw7heJyep2JBp6S/thrive-contour-card-texture-Px4q3uH2RqPUeDpHF53swu.webp";

const ethnicityOptions = [
  "South Asian",
  "Chinese",
  "Japanese",
  "South American",
  "Central American",
  "European",
  "Sub-Saharan African",
  "Middle Eastern",
  "Eastern Mediterranean",
];

const starterMetabolic: MetabolicValues = {
  triglycerides: "",
  hdl: "",
  glucose: "",
  systolic: "",
  diastolic: "",
  sex: "",
  ethnicity: "",
  waist: "",
};

function numberValue(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function formatNumber(value: number, digits = 1) {
  return Number.isInteger(value) ? String(value) : value.toFixed(digits);
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function evaluateMetabolic(values: MetabolicValues): MetabolicResult {
  const triglycerides = numberValue(values.triglycerides);
  const hdl = numberValue(values.hdl);
  const glucose = numberValue(values.glucose);
  const systolic = numberValue(values.systolic);
  const diastolic = numberValue(values.diastolic);
  const waist = numberValue(values.waist);
  const maleSmallWaistEthnicities = ["South Asian", "Chinese", "Japanese", "South American", "Central American"];
  const waistThreshold = values.sex === "female" ? 31.5 : maleSmallWaistEthnicities.includes(values.ethnicity) ? 35 : 37;

  const biomarkers: BiomarkerResult[] = [
    {
      key: "triglycerides",
      name: "Triglycerides",
      value: `${formatNumber(triglycerides)} mg/dL`,
      inRange: triglycerides <= 80,
      criteria: "Within range: 80 mg/dL or below.",
      distance: triglycerides <= 80 ? "Within range." : `${formatNumber(triglycerides - 80)} mg/dL above the target ceiling.`,
    },
    {
      key: "hdl",
      name: "High-Density Lipoprotein (HDL) Cholesterol",
      value: `${formatNumber(hdl)} mg/dL`,
      inRange: hdl >= 50 && hdl <= 90,
      criteria: "Within range: 50–90 mg/dL, inclusive.",
      distance: hdl < 50 ? `${formatNumber(50 - hdl)} mg/dL below the target floor.` : hdl > 90 ? `${formatNumber(hdl - 90)} mg/dL above the target ceiling.` : "Within range.",
    },
    {
      key: "glucose",
      name: "Fasting Glucose",
      value: `${formatNumber(glucose)} mg/dL`,
      inRange: glucose >= 70 && glucose <= 85,
      criteria: "Within range: 70–85 mg/dL, inclusive.",
      distance: glucose < 70 ? `${formatNumber(70 - glucose)} mg/dL below the target floor.` : glucose > 85 ? `${formatNumber(glucose - 85)} mg/dL above the target ceiling.` : "Within range.",
    },
    {
      key: "bloodPressure",
      name: "Blood Pressure",
      value: `${formatNumber(systolic)}/${formatNumber(diastolic)} mmHg`,
      inRange: systolic <= 120 && diastolic <= 80,
      criteria: "Within range: systolic 120 mmHg or below and diastolic 80 mmHg or below.",
      distance:
        systolic <= 120 && diastolic <= 80
          ? "Within range."
          : [`Systolic: ${systolic <= 120 ? "within range" : `${formatNumber(systolic - 120)} mmHg high`}`, `Diastolic: ${diastolic <= 80 ? "within range" : `${formatNumber(diastolic - 80)} mmHg high`}`].join("; "),
    },
    {
      key: "waist",
      name: "Waist Circumference",
      value: `${formatNumber(waist)} inches (${values.sex || "sex not selected"}, ${values.ethnicity || "ethnicity not selected"})`,
      inRange: waist <= waistThreshold,
      criteria: `Within range for this selection: ${waistThreshold} inches or below.`,
      distance: waist <= waistThreshold ? "Within range." : `${formatNumber(waist - waistThreshold)} inches above the target ceiling.`,
    },
  ];

  const healthyCount = biomarkers.filter((item) => item.inRange).length;
  return {
    kind: "metabolic",
    summary: healthyCount === 5 ? "Good Metabolic Health" : `${healthyCount} of 5 biomarkers in healthy range`,
    values,
    biomarkers,
    healthyCount,
  };
}

function evaluateRatio(values: RatioValues): RatioResult {
  const triglycerides = numberValue(values.triglycerides);
  const hdl = numberValue(values.hdl);
  const ratio = triglycerides / hdl;
  if (ratio <= 1) {
    return { kind: "ratio", ratio, values, status: "Within Optimal Range", tone: "green" };
  }
  if (ratio <= 1.5) {
    return {
      kind: "ratio",
      ratio,
      values,
      status: "Within Target Range",
      tone: "lightGreen",
      details: [`Optimal range is 1.0 or below. This result is ${formatNumber(ratio - 1, 2)} ratio points above optimal.`],
    };
  }
  if (ratio <= 3) {
    return {
      kind: "ratio",
      ratio,
      values,
      status: "Making progress",
      tone: "yellow",
      details: [
        "Target range begins at 1.5 or below; optimal range is 1.0 or below.",
        `This result is ${formatNumber(ratio - 1.5, 2)} ratio points above target range and ${formatNumber(ratio - 1, 2)} ratio points above optimal range.`,
      ],
    };
  }
  return {
    kind: "ratio",
    ratio,
    values,
    status: "Outside of range",
    tone: "red",
    details: [
      "Improvement range begins at 3.0 or below, target range begins at 1.5 or below, and optimal range is 1.0 or below.",
      `This result is ${formatNumber(ratio - 3, 2)} ratio points above 3.0, ${formatNumber(ratio - 1.5, 2)} above target range, and ${formatNumber(ratio - 1, 2)} above optimal range.`,
    ],
  };
}

function validateMetabolic(values: MetabolicValues) {
  const requiredNumbers = [values.triglycerides, values.hdl, values.glucose, values.systolic, values.diastolic, values.waist];
  return requiredNumbers.every((value) => numberValue(value) >= 0) && values.sex && values.ethnicity;
}

function validateRatio(values: RatioValues) {
  return numberValue(values.triglycerides) >= 0 && numberValue(values.hdl) > 0;
}

function StatusIcon({ good, neutral }: { good: boolean; neutral?: boolean }) {
  if (neutral) return null;
  return good ? <Check className="status-icon" aria-hidden="true" /> : <X className="status-icon" aria-hidden="true" />;
}

function BackHome({ setPage }: { setPage: (page: Page) => void }) {
  return (
    <button className="back-button" onClick={() => setPage("home")}>
      <ArrowLeft size={18} /> Back to Home
    </button>
  );
}

function SectionShell({ eyebrow, title, children, setPage, className }: { eyebrow: string; title: string; children: React.ReactNode; setPage: (page: Page) => void; className?: string }) {
  return (
    <main className={`app-shell subpage-shell ${className || ""}`.trim()}>
      <BackHome setPage={setPage} />
      <section className="page-intro">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
      </section>
      {children}
    </main>
  );
}

function Field({ label, children, note }: { label: string; children: React.ReactNode; note?: string }) {
  return (
    <label className="field-card">
      <span>{label}</span>
      {children}
      {note && <small>{note}</small>}
    </label>
  );
}

function BiomarkerResultCard({ item }: { item: BiomarkerResult }) {
  return (
    <article className={`result-card ${item.inRange ? "tone-green" : "tone-red"}`}>
      <div className="result-card-head">
        <div>
          <h3>{item.name}</h3>
          <p>{item.value}</p>
        </div>
        <span className="status-pill">
          <StatusIcon good={item.inRange} /> {item.inRange ? "Within range" : "Out of range"}
        </span>
      </div>
      {!item.inRange && (
        <details className="result-details">
          <summary>
            View target criteria <ChevronDown size={16} />
          </summary>
          <p>{item.criteria}</p>
          <p><strong>Your distance from range:</strong> {item.distance}</p>
        </details>
      )}
    </article>
  );
}

function RatioResultCard({ result }: { result: RatioResult }) {
  const neutral = result.tone === "yellow" || result.tone === "lightGreen";
  return (
    <article className={`result-card tone-${result.tone}`}>
      <div className="result-card-head">
        <div>
          <h3>Triglyceride-to-HDL Ratio</h3>
          <p>Recorded ratio: <strong>{formatNumber(result.ratio, 2)}</strong></p>
          <p className="recorded-values">Triglycerides: {result.values.triglycerides} mg/dL · HDL: {result.values.hdl} mg/dL</p>
        </div>
        <span className="status-pill">
          <StatusIcon good={result.tone === "green"} neutral={neutral} /> {result.status}
        </span>
      </div>
      {result.details && result.details.length > 0 && (
        <details className="result-details">
          <summary>
            {result.status === "Within Target Range" ? "View optimal guidance" : "View target and optimal guidance"} <ChevronDown size={16} />
          </summary>
          {result.details.map((detail) => <p key={detail}>{detail}</p>)}
        </details>
      )}
    </article>
  );
}

function SavePanel({ onSave }: { onSave: (date: string, notes: string, title?: string) => void }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  return (
    <div className="save-panel">
      <h3>Save this assessment</h3>
      <p>Add a date, optional title, and note. Your record will be stored locally in this browser.</p>
      <div className="save-grid">
        <Field label="Assessment date">
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </Field>
        <Field label="Title (optional)">
          <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Spring wellness check" />
        </Field>
        <Field label="Additional notes (optional)">
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add context, goals, medication changes, or lifestyle notes." />
        </Field>
      </div>
      <button className="primary-button" onClick={() => onSave(date, notes, title.trim() || undefined)} disabled={!date}>
        <Save size={18} /> Save to Assessment Records
      </button>
    </div>
  );
}

function MetabolicAssessment({ setPage, onSaveRecord }: { setPage: (page: Page) => void; onSaveRecord: (record: AssessmentRecord) => void }) {
  const [values, setValues] = useState<MetabolicValues>(starterMetabolic);
  const [result, setResult] = useState<MetabolicResult | null>(null);
  const [saving, setSaving] = useState(false);
  const update = (key: keyof MetabolicValues, value: string) => setValues((current) => ({ ...current, [key]: value }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateMetabolic(values)) {
      toast.error("Please complete every metabolic biomarker field with valid values before calculating results.");
      return;
    }
    setResult(evaluateMetabolic(values));
    setSaving(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (result) {
    return (
      <SectionShell eyebrow="Assessment results" title="Metabolic Health Results" setPage={setPage} className="printable-content">
        <section className="summary-band">
          <div>
            <span className="eyebrow">Overall status</span>
            <h2>{result.summary}</h2>
            
          </div>
          <div className="score-orb"><span>{result.healthyCount} / 5</span></div>
        </section>
        <div className="results-stack">
          {result.biomarkers.map((item) => <BiomarkerResultCard item={item} key={item.key} />)}
        </div>
        <div className="action-row">
          <button className="secondary-button" onClick={() => window.print()}><Printer size={18} /> Print Results</button>
          <button className="secondary-button" onClick={() => { setResult(null); setSaving(false); }}><Pencil size={18} /> Edit entered data</button>
          <button className="secondary-button" onClick={() => setPage("home")}><HomeIcon size={18} /> Home screen</button>
          <button className="primary-button" onClick={() => setSaving((open) => !open)}><Save size={18} /> Save record</button>
        </div>
        {saving && <SavePanel onSave={(date, notes, title) => {
          onSaveRecord({ id: createId(), type: "metabolic", date, notes, result, createdAt: new Date().toISOString(), ...(title ? { title } : {}) });
          setSaving(false);
          toast.success("Metabolic Health Assessment saved to Assessment Records.");
        }} />}
      </SectionShell>
    );
  }

  return (
    <SectionShell eyebrow="Metabolic Health Assessment" title="Understanding your metabolic biomarkers" setPage={setPage}>
      <p className="lead-copy">There are five different biomarkers that can indicate your metabolic health. Answer the following questions regarding these to better understand how you’re doing and where you can improve.</p>
      <form className="assessment-form" onSubmit={submit}>
        <AssessmentBlock title="Triglycerides" description="Triglycerides are a type of fat formed from carbohydrates and sugars. They provide the body with energy during periods of fasting. However, if triglycerides are too high it can negatively impact your health. Please enter your triglyceride levels.">
          <Field label="Triglyceride level"><input type="number" min="0" step="0.1" value={values.triglycerides} onChange={(event) => update("triglycerides", event.target.value)} placeholder="80" /><small>mg/dL</small></Field>
        </AssessmentBlock>
        <AssessmentBlock title="High-Density Lipoprotein (HDL) Cholesterol" description="HDL helps remove cholesterol from the blood to be processed by the liver. A higher HDL is good, indicating lower risk of heart disease and stroke. Please enter your HDL.">
          <Field label="HDL level"><input type="number" min="0" step="0.1" value={values.hdl} onChange={(event) => update("hdl", event.target.value)} placeholder="55" /><small>mg/dL</small></Field>
        </AssessmentBlock>
        <AssessmentBlock title="Fasting Glucose" description="Measuring your blood sugar after fasting for 8 hours can indicate if you have insulin resistance. If fasting glucose is high, mitochondrial dysfunction, oxidative stress, and chronic inflammation may be preventing your cells from properly transmitting insulin signals, causing this resistance. Please enter your fasting glucose.">
          <Field label="Fasting glucose"><input type="number" min="0" step="0.1" value={values.glucose} onChange={(event) => update("glucose", event.target.value)} placeholder="82" /><small>mg/dL</small></Field>
        </AssessmentBlock>
        <AssessmentBlock title="Blood Pressure" description="High blood pressure can cause stiffness and blockages in blood vessels over time, limiting blood flow. It is directly related to insulin resistance and is a risk factor for many cardiovascular diseases. Please enter your blood pressure.">
          <div className="two-col"><Field label="Systolic"><input type="number" min="0" step="1" value={values.systolic} onChange={(event) => update("systolic", event.target.value)} placeholder="120" /><small>mmHg</small></Field><Field label="Diastolic"><input type="number" min="0" step="1" value={values.diastolic} onChange={(event) => update("diastolic", event.target.value)} placeholder="80" /><small>mmHg</small></Field></div>
        </AssessmentBlock>
        <AssessmentBlock title="Waist Circumference" description="Waist circumference is a good starting place to assess your level of visceral fat. This surrounds organs and can increase the risk of disease, chronic inflammation, and early death. It should be measured at the top of the hip bone near belly button level, and can vary based on sex and ethnicity. Please answer the related questions.">
          <div className="three-col"><Field label="Sex"><select value={values.sex} onChange={(event) => update("sex", event.target.value)}><option value="">Select sex</option><option value="female">Female</option><option value="male">Male</option></select></Field><Field label="Ethnicity"><select value={values.ethnicity} onChange={(event) => update("ethnicity", event.target.value)}><option value="">Select ethnicity</option>{ethnicityOptions.map((option) => <option value={option} key={option}>{option}</option>)}</select></Field><Field label="Waist circumference"><input type="number" min="0" step="0.1" value={values.waist} onChange={(event) => update("waist", event.target.value)} placeholder="34" /><small>inches</small></Field></div>
        </AssessmentBlock>
        <button className="primary-button form-submit" type="submit"><Activity size={18} /> Calculate metabolic health results</button>
      </form>
    </SectionShell>
  );
}

function AssessmentBlock({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="assessment-block">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="assessment-inputs">{children}</div>
    </section>
  );
}

function RatioAssessment({ setPage, onSaveRecord }: { setPage: (page: Page) => void; onSaveRecord: (record: AssessmentRecord) => void }) {
  const [values, setValues] = useState<RatioValues>({ triglycerides: "", hdl: "" });
  const [result, setResult] = useState<RatioResult | null>(null);
  const [saving, setSaving] = useState(false);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateRatio(values)) {
      toast.error("Please enter a valid triglyceride value and an HDL value greater than zero.");
      return;
    }
    setResult(evaluateRatio(values));
    setSaving(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (result) {
    return (
      <SectionShell eyebrow="Assessment results" title="Triglyceride-to-HDL Ratio Results" setPage={setPage} className="printable-content">
        <div className="results-stack"><RatioResultCard result={result} /></div>
        <div className="action-row">
          <button className="secondary-button" onClick={() => window.print()}><Printer size={18} /> Print Results</button>
          <button className="secondary-button" onClick={() => { setResult(null); setSaving(false); }}><Pencil size={18} /> Edit entered data</button>
          <button className="secondary-button" onClick={() => setPage("home")}><HomeIcon size={18} /> Home screen</button>
          <button className="primary-button" onClick={() => setSaving((open) => !open)}><Save size={18} /> Save record</button>
        </div>
        {saving && <SavePanel onSave={(date, notes, title) => {
          onSaveRecord({ id: createId(), type: "ratio", date, notes, result, createdAt: new Date().toISOString(), ...(title ? { title } : {}) });
          setSaving(false);
          toast.success("Triglyceride-to-HDL Ratio Assessment saved to Assessment Records.");
        }} />}
      </SectionShell>
    );
  }

  return (
    <SectionShell eyebrow="Triglyceride-to-HDL Ratio Assessment" title="Assessing your heart attack risk" setPage={setPage}>
      <p className="lead-copy">The Triglyceride-to-HDL Ratio is a great assessment for insulin resistance, cardiovascular disease, and risk of heart attack. A lower ratio, indicating you have lower triglycerides and higher HDL, is better for your health. Please enter your triglyceride and HDL levels below to calculate your ratio.</p>
      <form className="assessment-form compact-form" onSubmit={submit}>
        <div className="two-col"><Field label="Triglycerides"><input type="number" min="0" step="0.1" value={values.triglycerides} onChange={(event) => setValues((current) => ({ ...current, triglycerides: event.target.value }))} placeholder="100" /><small>mg/dL</small></Field><Field label="HDL Cholesterol"><input type="number" min="0" step="0.1" value={values.hdl} onChange={(event) => setValues((current) => ({ ...current, hdl: event.target.value }))} placeholder="55" /><small>mg/dL</small></Field></div>
        <button className="primary-button form-submit" type="submit"><Activity size={18} /> Calculate ratio results</button>
      </form>
    </SectionShell>
  );
}

function ProgressTrail({ steps, total, label }: { steps: number; total: number; label: string }) {
  const safeSteps = Math.max(0, Math.min(steps, total));
  const position = total === 1 ? 100 : (safeSteps / total) * 100;
  return (
    <div className="trail-card" aria-label={label}>
      <div className="trail-line">
        {Array.from({ length: total + 1 }).map((_, index) => {
          const left = `${(index / total) * 100}%`;
          return index === total ? (
            <span className="trail-mark trail-finish" style={{ left }} key={index}>
              <FlagTriangleRight size={20} stroke="#2C3E2D" fill="#2C3E2D" strokeWidth={2} />
            </span>
          ) : (
            <span className="trail-mark" style={{ left }} key={index} />
          );
        })}
        <span className="trail-runner" style={{ left: `${position}%` }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#2C3E2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <circle cx="7" cy="4" r="2" />
            <path d="M7 6l2 2 2-2" />
            <path d="M9 8l2 3" />
            <path d="M11 11l3 1" />
            <path d="M9 8l-1 4" />
            <path d="M8 12l-2 4" />
          </svg>
        </span>
      </div>
      <div className="trail-labels"><span>Start</span><span>Finish</span></div>
    </div>
  );
}

function ProgressTracker({ setPage, records }: { setPage: (page: Page) => void; records: AssessmentRecord[] }) {
  const latestMetabolic = useMemo(() => latestByType(records, "metabolic"), [records]);
  const latestRatio = useMemo(() => latestByType(records, "ratio"), [records]);
  const metabolicScore = latestMetabolic?.result.kind === "metabolic" ? latestMetabolic.result.healthyCount : undefined;
  const ratioSteps = latestRatio?.result.kind === "ratio" ? latestRatio.result.ratio > 3 ? 0 : latestRatio.result.ratio > 1.5 ? 1 : latestRatio.result.ratio > 1 ? 2 : 3 : 0;

  return (
    <SectionShell eyebrow="Progress Tracker" title="Your latest health snapshot" setPage={setPage}>
      {!latestMetabolic && !latestRatio && <div className="empty-state"><Leaf size={34} /><p>To track your health progress, please complete the Metabolic Health and/or Triglyceride-to-HDL Ratio Assessments and save their results.</p></div>}
      <div className="progress-grid">
        {latestMetabolic?.result.kind === "metabolic" && (
          <section className="progress-section">
            <span className="eyebrow">Based on {formatDate(latestMetabolic.date)} results</span>
            <h2>Metabolic Health{typeof metabolicScore === "number" ? ` (${metabolicScore}/5)` : ""}</h2>
            <div className="results-stack">{latestMetabolic.result.biomarkers.map((item) => <BiomarkerResultCard item={item} key={item.key} />)}</div>
            <ProgressTrail steps={latestMetabolic.result.healthyCount} total={5} label="Metabolic health progress trail" />
          </section>
        )}
        {latestRatio?.result.kind === "ratio" && (
          <section className="progress-section">
            <span className="eyebrow">Based on {formatDate(latestRatio.date)} results</span>
            <h2>Triglyceride-to-HDL Ratio</h2>
            <RatioResultCard result={latestRatio.result} />
            <ProgressTrail steps={ratioSteps} total={3} label="Triglyceride-to-HDL progress trail" />
          </section>
        )}
      </div>
    </SectionShell>
  );
}

function latestByType(records: AssessmentRecord[], type: "metabolic" | "ratio") {
  return records.filter((record) => record.type === type).sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime())[0];
}

function formatDate(date: string) {
  if (!date) return "Undated";
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function RecordsPage({ setPage, records, setRecords }: { setPage: (page: Page) => void; records: AssessmentRecord[]; setRecords: React.Dispatch<React.SetStateAction<AssessmentRecord[]>> }) {
  const [selectedMetabolicId, setSelectedMetabolicId] = useState<string | null>(null);
  const [selectedRatioId, setSelectedRatioId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [titleDrafts, setTitleDrafts] = useState<Record<string, string>>({});
  const latestMetabolic = useMemo(() => latestByType(records, "metabolic"), [records]);
  const metabolicScore = latestMetabolic?.result.kind === "metabolic" ? latestMetabolic.result.healthyCount : undefined;
  const metabolicRecords = records.filter((record) => record.type === "metabolic");
  const ratioRecords = records.filter((record) => record.type === "ratio");

  const exportRecords = () => {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `thrive-health-tracker-records-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importRecords = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result));
        if (!Array.isArray(imported)) throw new Error("Invalid backup file");
        setRecords((prevRecords) => {
          const existingIds = new Set(prevRecords.map((record) => record.id));
          const existingTimestamps = new Set(prevRecords.map((record) => record.createdAt || record.date));
          const mergedRecords = [...prevRecords];

          imported.forEach((record: AssessmentRecord) => {
            const recordTimestamp = record.createdAt || record.date;
            const isDuplicate = existingIds.has(record.id) || existingTimestamps.has(recordTimestamp);
            if (!isDuplicate) {
              mergedRecords.push(record);
              existingIds.add(record.id);
              existingTimestamps.add(recordTimestamp);
            }
          });

          return mergedRecords;
        });
        toast.success("Records imported successfully.");
      } catch {
        toast.error("That file could not be imported. Please choose a valid Thrive Health Tracker backup JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const updateRecord = (record: AssessmentRecord) => {
    const nextNotes = noteDrafts[record.id] ?? record.notes;
    const nextTitle = Object.prototype.hasOwnProperty.call(titleDrafts, record.id) ? titleDrafts[record.id] : record.title;
    setRecords((current) => current.map((item) => item.id === record.id ? { ...item, notes: nextNotes, title: nextTitle } : item));
    toast.success("Record updated.");
  };

  const deleteRecord = (id: string) => {
    setRecords((current) => current.filter((record) => record.id !== id));
    if (selectedMetabolicId === id) setSelectedMetabolicId(null);
    if (selectedRatioId === id) setSelectedRatioId(null);
    toast.success("Record deleted.");
  };

  return (
    <SectionShell eyebrow="Assessment Records" title="Your health history" setPage={setPage}>
      <div className="privacy-notice"><strong>Data Privacy & Storage Notice:</strong> Your health records are stored locally on this device and within this specific browser. Clearing your browser cache or history may permanently erase your records. We strongly recommend using the "Export" feature periodically to create a backup file. You can re-import this file on any device at any time to restore your entire history and keep your Progress Tracker updated.</div>
      <div className="records-actions"><button className="secondary-button" onClick={() => window.print()}><Printer size={18} /> Print page</button><button className="secondary-button" onClick={exportRecords}><Download size={18} /> Export backup</button><label className="secondary-button file-button"><Upload size={18} /> Import backup<input type="file" accept="application/json" onChange={(event) => importRecords(event.target.files?.[0])} /></label></div>
      <div className="record-columns">
        <RecordSection title="Metabolic Health Assessments" records={metabolicRecords} selectedId={selectedMetabolicId} setSelectedId={setSelectedMetabolicId} noteDrafts={noteDrafts} setNoteDrafts={setNoteDrafts} titleDrafts={titleDrafts} setTitleDrafts={setTitleDrafts} updateRecord={updateRecord} deleteRecord={deleteRecord} />
        <RecordSection title="Triglyceride-to-HDL Ratio Assessments" records={ratioRecords} selectedId={selectedRatioId} setSelectedId={setSelectedRatioId} noteDrafts={noteDrafts} setNoteDrafts={setNoteDrafts} titleDrafts={titleDrafts} setTitleDrafts={setTitleDrafts} updateRecord={updateRecord} deleteRecord={deleteRecord} />
      </div>
    </SectionShell>
  );
}

function RecordSection({ title, records, selectedId, setSelectedId, noteDrafts, setNoteDrafts, titleDrafts, setTitleDrafts, updateRecord, deleteRecord }: {
  title: string;
  records: AssessmentRecord[];
  selectedId: string | null;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  noteDrafts: Record<string, string>;
  setNoteDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  titleDrafts: Record<string, string>;
  setTitleDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  updateRecord: (record: AssessmentRecord) => void;
  deleteRecord: (id: string) => void;
}) {
  return (
    <section className="record-section">
      <h2>{title}</h2>
      {records.length === 0 && <p className="muted-copy">No records saved yet.</p>}
      {records.map((record) => {
        const open = selectedId === record.id;
        return (
          <article className="record-card" key={record.id}>
            <button className="record-title" onClick={() => setSelectedId(open ? null : record.id)}>
              <span>
                {record.title ? (
                  <>
                    {formatDate(record.date)} · <strong>{record.title}</strong>
                  </>
                ) : (
                  formatDate(record.date)
                )}
              </span>
              <div className="record-title-actions">
                {record.result.kind === "metabolic" && <div className="record-score">{record.result.healthyCount}/5</div>}
                <ChevronDown size={18} />
              </div>
            </button>
            {open && <div className="record-body">
              {record.result.kind === "metabolic" ? <div className="results-stack">{record.result.biomarkers.map((item) => <BiomarkerResultCard item={item} key={item.key} />)}</div> : <RatioResultCard result={record.result} />}
              <Field label="Title"><input type="text" value={titleDrafts[record.id] ?? record.title ?? ""} onChange={(event) => setTitleDrafts((current) => ({ ...current, [record.id]: event.target.value }))} placeholder="Edit record title" /></Field>
              <Field label="Notes"><textarea value={noteDrafts[record.id] ?? record.notes} onChange={(event) => setNoteDrafts((current) => ({ ...current, [record.id]: event.target.value }))} placeholder="Add or revise notes for this record." /></Field>
              <div className="action-row small"><button className="primary-button" onClick={() => updateRecord(record)}><Save size={16} /> Update record</button><button className="danger-button" onClick={() => deleteRecord(record.id)}><Trash2 size={16} /> Delete record</button></div>
            </div>}
          </article>
        );
      })}
    </section>
  );
}

function HomeScreen({ setPage, records }: { setPage: (page: Page) => void; records: AssessmentRecord[] }) {
  const latestMetabolic = latestByType(records, "metabolic");
  const latestRatio = latestByType(records, "ratio");
  const navCards = [
    { page: "metabolic" as Page, title: "Metabolic Health Assessment", copy: "Enter data for five metabolic biomarkers to see which fall within a healthy range.", icon: HeartPulse },
    { page: "ratio" as Page, title: "Triglyceride-to-HDL Ratio Assessment", copy: "Calculate a ratio associated with your insulin resistance and cardiovascular risk.", icon: Activity },
    { page: "progress" as Page, title: "Progress Tracker", copy: "Review your latest saved assessments to track progress towards your best health.", icon: null },
    { page: "records" as Page, title: "Assessment Records", copy: "Open, edit notes, delete, print, export, or import locally stored records.", icon: ClipboardList },
  ];
  return (
    <main className="home-shell">
      <section className="hero-section" style={{ backgroundImage: `linear-gradient(90deg, rgba(252,247,235,.98) 0%, rgba(252,247,235,.88) 42%, rgba(252,247,235,.14) 72%), url(${HERO_IMAGE})` }}>
        <div className="hero-copy">
          <span className="brand-mark">Thrive</span>
          <h1>Health Tracker</h1>
          <p>Better understand your health with our metabolic and triglyceride-to-HDL ratio asssessments. Track results to visualize your progress, one step at a time.</p>
        </div>
      </section>
      <section className="home-grid home-grid--single-column">
        <div className="destination-grid">
          {navCards.map(({ page, title, copy, icon: Icon }) => <button className={`destination-card ${page === "metabolic" || page === "ratio" ? "assessment-card" : "management-card"}`} key={page} onClick={() => setPage(page)}>
            {page === "progress" ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2C3E2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
            ) : (
              Icon ? <Icon size={24} style={{ color: '#2C3E2D' }} /> : null
            )}
            <h3>{title}</h3><p>{copy}</p><span></span></button>)}
        </div>
      </section>
    </main>
  );
}

export default function Home() {
  const [page, setPage] = useState<Page>("home");
  const [records, setRecords] = useState<AssessmentRecord[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("thrive-health-tracker-records") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("thrive-health-tracker-records", JSON.stringify(records));
  }, [records]);

  const onSaveRecord = (record: AssessmentRecord) => setRecords((current) => [record, ...current]);

  if (page === "metabolic") return <MetabolicAssessment setPage={setPage} onSaveRecord={onSaveRecord} />;
  if (page === "ratio") return <RatioAssessment setPage={setPage} onSaveRecord={onSaveRecord} />;
  if (page === "progress") return <ProgressTracker setPage={setPage} records={records} />;
  if (page === "records") return <RecordsPage setPage={setPage} records={records} setRecords={setRecords} />;
  return <HomeScreen setPage={setPage} records={records} />;
}
