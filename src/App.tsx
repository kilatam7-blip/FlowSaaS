import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  Cloud,
  Copy,
  LayoutDashboard,
  ListTodo,
  Loader2,
  Menu,
  PieChart,
  Play,
  Quote,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "./utils/cn";
import { createAccount, createLead, signIn } from "./lib/appwrite";

/* ============================================================
   Tipe & data konten
   ============================================================ */

type Feature = {
  icon: LucideIcon;
  title: string;
  desc: string;
  bullets: string[];
};

type InfoKey =
  | "integrations"
  | "changelog"
  | "help"
  | "guides"
  | "webinars"
  | "api"
  | "about"
  | "careers"
  | "blog"
  | "privacy"
  | "terms";

type ModalState =
  | { kind: "auth"; mode: "signin" | "signup" }
  | { kind: "demo" }
  | { kind: "contact" }
  | { kind: "pricing" }
  | { kind: "feature"; feature: Feature }
  | { kind: "info"; page: InfoKey };

const FEATURES: Feature[] = [
  {
    icon: Workflow,
    title: "Workflow Automation",
    desc: "Turn repetitive processes into one-click automations that never miss a step.",
    bullets: [
      "Visual no-code builder with 40+ triggers",
      "Conditional branching & scheduled runs",
      "Full run history with one-click replay",
    ],
  },
  {
    icon: Users,
    title: "Team Collaboration",
    desc: "Shared boards, comments, and mentions keep everyone moving in sync.",
    bullets: [
      "Real-time presence & live cursors",
      "Threaded comments on any block",
      "Guest access with granular permissions",
    ],
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    desc: "Live dashboards turn raw activity into decisions you can defend.",
    bullets: [
      "Drag-and-drop dashboard builder",
      "Scheduled email & Slack reports",
      "Export to CSV, PDF, or the API",
    ],
  },
  {
    icon: ListTodo,
    title: "Task Management",
    desc: "Prioritize, assign, and track work with lists, boards, and timelines.",
    bullets: [
      "List, board, calendar & Gantt views",
      "Custom fields, labels, and filters",
      "Subtasks, dependencies & milestones",
    ],
  },
  {
    icon: Cloud,
    title: "Cloud Storage",
    desc: "Every file lives next to the work it belongs to — searchable forever.",
    bullets: [
      "Unlimited version history on Business",
      "Preview 100+ file types in place",
      "Sync with Drive, Dropbox & OneDrive",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    desc: "SSO, audit logs, and SOC 2 compliance come standard on every plan.",
    bullets: [
      "SAML SSO & SCIM provisioning",
      "Audit logs with 12-month retention",
      "SOC 2 Type II & GDPR ready",
    ],
  },
];

const TESTIMONIALS = [
  {
    quote:
      "FlowSaaS replaced four separate tools for us. Campaign planning that used to take days now happens in hours — and everyone finally works from the same source of truth.",
    name: "Jessica Lee",
    role: "Marketing Director, BrightCo",
    initials: "JL",
    tone: "bg-primary-500",
  },
  {
    quote:
      "The automation engine is unreal. We shipped our entire roadmap two weeks early because status updates and handoffs simply happen on their own now.",
    name: "Daniel Kim",
    role: "Product Manager, TechNova",
    initials: "DK",
    tone: "bg-primary-700",
  },
  {
    quote:
      "As a founder, visibility is everything. One dashboard tells me what's moving, what's stuck, and who needs help — before anyone even has to ask.",
    name: "Sophia Martinez",
    role: "CEO, Startly",
    initials: "SM",
    tone: "bg-navy-800",
  },
];

const BENEFITS = [
  {
    title: "Increase Productivity",
    desc: "Automate the busywork so your team spends the day on work that actually moves the needle.",
  },
  {
    title: "Improve Visibility",
    desc: "Real-time dashboards show exactly where every project stands — no more status meetings.",
  },
  {
    title: "Scale With Confidence",
    desc: "Enterprise-grade infrastructure and permissions that grow alongside your team.",
  },
];

const RESOURCES_LINKS: { label: string; page: InfoKey }[] = [
  { label: "Help Center", page: "help" },
  { label: "Guides", page: "guides" },
  { label: "Webinars", page: "webinars" },
  { label: "API Docs", page: "api" },
];

type Plan = {
  name: string;
  monthly: number;
  tagline: string;
  features: string[];
  cta: "start" | "contact";
  popular?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Starter",
    monthly: 15,
    tagline: "Perfect for small teams",
    features: ["Up to 10 seats", "Core automations", "2 GB cloud storage", "Community support"],
    cta: "start",
  },
  {
    name: "Business",
    monthly: 39,
    tagline: "Advanced tools for growing teams",
    features: [
      "Unlimited seats",
      "Advanced analytics",
      "100 GB storage + versioning",
      "Priority support & SSO",
    ],
    cta: "start",
    popular: true,
  },
  {
    name: "Enterprise",
    monthly: 0,
    tagline: "Custom plans for your organization",
    features: ["Dedicated infrastructure", "SCIM & audit logs", "Custom SLA", "Success manager"],
    cta: "contact",
  },
];

/* Konten dashboard mini di hero */
const ACTIVITY_POOL = [
  { ini: "AR", tone: "bg-primary-500", name: "Amara R.", action: "completed “Q3 Campaign”" },
  { ini: "JK", tone: "bg-primary-700", name: "Jonas K.", action: "commented on API Redesign" },
  { ini: "PT", tone: "bg-navy-800", name: "Priya T.", action: "uploaded 4 files to Docs" },
  { ini: "MO", tone: "bg-primary-500", name: "Mia Osei", action: "started “Pricing A/B Test”" },
  { ini: "LS", tone: "bg-primary-700", name: "Leo Sato", action: "merged feat/webhook-retries" },
  { ini: "NV", tone: "bg-navy-800", name: "Nina Volk", action: "closed 5 tasks in Sprint 14" },
  { ini: "TB", tone: "bg-primary-500", name: "Tom Becker", action: "shared “Board Metrics” report" },
];

const MINI_TASKS = [
  { label: "Finalize Q3 roadmap", done: true },
  { label: "Review pricing copy", done: true },
  { label: "Ship webhook retries", done: false },
  { label: "Prep customer interview", done: false },
  { label: "Update API changelog", done: false },
];

const MINI_WORKFLOWS = [
  { name: "Invoice reminders", desc: "Finance · runs daily" },
  { name: "Lead routing", desc: "Sales · on new lead" },
  { name: "Standup digest", desc: "Team · 9:00 AM" },
];

const MINI_SETTINGS = ["Email digest", "Push notifications", "Weekly PDF report"];

const CHART_SETS = [
  { label: "Weekly Output", delta: "+18%", bars: [42, 66, 50, 82, 58, 92, 74] },
  { label: "Tasks Shipped", delta: "+26%", bars: [58, 40, 74, 62, 88, 54, 96] },
  { label: "Active Workflows", delta: "+11%", bars: [70, 84, 56, 90, 64, 78, 60] },
];

/* ============================================================
   Hooks
   ============================================================ */

function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, inView };
}

function useCountUp(target: number, start: boolean, duration = 1500) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);

  return value;
}

/** Tilt 3D halus mengikuti kursor — diinterpolasi (lerp) tiap frame. */
function useTilt(maxDeg = 5) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
    };
    const loop = () => {
      current.x += (target.x - current.x) * 0.075;
      current.y += (target.y - current.y) * 0.075;
      el.style.transform = `perspective(1100px) rotateX(${(-current.y * maxDeg).toFixed(3)}deg) rotateY(${(current.x * maxDeg).toFixed(3)}deg)`;
      raf = requestAnimationFrame(loop);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
      el.style.transform = "";
    };
  }, [maxDeg]);

  return ref;
}

/* ============================================================
   UI context: modal + toast (dipakai semua section)
   ============================================================ */

type UIApi = {
  open: (modal: ModalState) => void;
  close: () => void;
  toast: (msg: string) => void;
};

const UICtx = createContext<UIApi | null>(null);
const useUI = () => useContext(UICtx)!;

/* ============================================================
   Komponen kecil bersama
   ============================================================ */

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn("reveal", inView && "is-visible", className)}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M16 2l12 7v14l-12 7-12-7V9z" fill="currentColor" />
      <path
        d="M11 12h10M11 16h7M11 20h9"
        stroke="#F8F9FC"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a href="#top" className="group flex items-center gap-2.5">
      <LogoMark
        className={cn(
          "h-9 w-9 transition-transform duration-300 group-hover:rotate-[18deg]",
          light ? "text-primary-400" : "text-primary-500"
        )}
      />
      <span
        className={cn(
          "font-display text-xl font-bold tracking-tight",
          light ? "text-mist-50" : "text-navy-900"
        )}
      >
        Flow<span className={light ? "text-primary-300" : "text-primary-500"}>SaaS</span>
      </span>
    </a>
  );
}

function InitialsAvatar({
  initials,
  tone = "bg-primary-500",
  className = "h-10 w-10 text-sm",
}: {
  initials: string;
  tone?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-display font-semibold text-mist-50 ring-2 ring-white",
        tone,
        className
      )}
    >
      {initials}
    </span>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-primary-500">
      <span className="h-px w-6 bg-primary-300" />
      {children}
    </span>
  );
}

/** Switch kecil yang benar-benar berfungsi (dashboard mini). */
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors duration-300",
        on ? "bg-primary-500" : "bg-ink-300/50"
      )}
    >
      <span
        className={cn(
          "absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white shadow-soft transition-transform duration-300",
          on && "translate-x-3"
        )}
      />
    </button>
  );
}

/** Input form dengan label + pesan error. */
function Field({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-navy-900">{label}</span>
      <input
        {...props}
        className={cn(
          "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-navy-900 outline-none transition-all duration-300 placeholder:text-ink-300 focus:border-primary-400 focus:ring-4 focus:ring-primary-100",
          error ? "border-rose-400" : "border-line-200"
        )}
      />
      {error && <span className="mt-1.5 block text-xs font-medium text-rose-500">{error}</span>}
    </label>
  );
}

/* ============================================================
   Modal shell + semua dialog (auth, demo, contact, pricing…)
   ============================================================ */

function Modal({
  title,
  subtitle,
  onClose,
  children,
  size = "md",
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  size?: "md" | "lg";
}) {
  // Tutup dengan Escape + kunci scroll body selama terbuka
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto p-4 sm:p-6">
      <div
        className="animate-fade-in fixed inset-0 bg-navy-900/55 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "animate-modal-in relative w-full overflow-hidden rounded-2xl border border-line-200 bg-white shadow-pop",
          size === "md" ? "max-w-md" : "max-w-3xl"
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line-200 px-6 py-5 sm:px-8">
          <div>
            <h3 className="font-display text-xl font-bold text-navy-900">{title}</h3>
            {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line-200 text-ink-400 transition-all duration-300 hover:rotate-90 hover:border-primary-300 hover:text-primary-500"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="max-h-[72vh] overflow-y-auto px-6 py-6 sm:px-8">{children}</div>
      </div>
    </div>
  );
}

/** Tampilan sukses setelah form terkirim. */
function SuccessView({ title, note, onDone }: { title: string; note: string; onDone: () => void }) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-primary-50 text-primary-500">
        <CheckCircle2 className="animate-modal-in h-9 w-9" />
      </span>
      <h4 className="mt-5 font-display text-xl font-bold text-navy-900">{title}</h4>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-500">{note}</p>
      <button
        onClick={onDone}
        className="btn-lift mt-7 rounded-lg bg-primary-500 px-7 py-3 text-sm font-semibold text-mist-50 shadow-soft hover:bg-primary-600"
      >
        Done
      </button>
    </div>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Dialog Sign in / Create account (satu komponen, dua mode). */
function AuthModal({ initialMode, onClose }: { initialMode: "signin" | "signup"; onClose: () => void }) {
  const ui = useUI();
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (mode === "signup" && name.trim().length < 2) errs.name = "Please enter your full name.";
    if (!EMAIL_RE.test(email)) errs.email = "Please enter a valid work email.";
    if (password.length < 8) errs.password = "Password must be at least 8 characters.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        await createAccount(name.trim(), email.trim(), password);
      } else {
        await signIn(email.trim(), password);
      }
      setDone(true);
      ui.toast(mode === "signup" ? "Account created — welcome to FlowSaaS!" : "Signed in successfully.");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <SuccessView
        title={mode === "signup" ? "Account created" : "Welcome back!"}
        note={
          mode === "signup"
            ? `Your account was created for ${email}. You can now sign in to FlowSaaS.`
            : "You are signed in to your FlowSaaS account."
        }
        onDone={onClose}
      />
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {mode === "signup" && (
        <Field
          label="Full name"
          placeholder="Ada Lovelace"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          autoFocus
        />
      )}
      <Field
        label="Work email"
        type="email"
        placeholder="ada@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        autoFocus={mode === "signin"}
      />
      <Field
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />
      <button
        type="submit"
        disabled={loading}
        className="btn-sheen btn-lift flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-5 py-3 text-sm font-semibold text-mist-50 shadow-soft hover:bg-primary-600 disabled:cursor-wait disabled:opacity-80"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {mode === "signup" ? "Create free account" : "Sign in"}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
      {submitError && <p role="alert" className="text-sm text-rose-600">{submitError}</p>}
      <p className="text-center text-sm text-ink-500">
        {mode === "signup" ? "Already have an account?" : "New to FlowSaaS?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "signup" ? "signin" : "signup");
            setErrors({});
          }}
          className="font-semibold text-primary-500 transition-colors hover:text-primary-600"
        >
          {mode === "signup" ? "Sign in" : "Start free trial"}
        </button>
      </p>
      <p className="border-t border-line-200 pt-4 text-center text-xs text-ink-300">
        14-day free trial · No credit card required · Cancel anytime
      </p>
    </form>
  );
}

/** Dialog Request a Demo. */
function DemoModal({ onClose }: { onClose: () => void }) {
  const ui = useUI();
  const [form, setForm] = useState({ name: "", email: "", company: "", size: "11–50", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = "Please enter your name.";
    if (!EMAIL_RE.test(form.email)) errs.email = "Please enter a valid work email.";
    if (form.company.trim().length < 2) errs.company = "Please enter your company name.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitError("");
    setLoading(true);
    try {
      await createLead({
        leadType: "demo",
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        teamSize: form.size,
        message: form.notes.trim(),
      });
      setDone(true);
      ui.toast("Demo request received — we'll be in touch!");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not save your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <SuccessView
        title="Demo booked!"
        note={`Thanks ${form.name.split(" ")[0]} — our team will email ${form.email} within one business day to schedule your walkthrough.`}
        onDone={onClose}
      />
    );
  }

  const inputCls = (err?: string) =>
    cn(
      "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-navy-900 outline-none transition-all duration-300 placeholder:text-ink-300 focus:border-primary-400 focus:ring-4 focus:ring-primary-100",
      err ? "border-rose-400" : "border-line-200"
    );

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" placeholder="Ada Lovelace" value={form.name} onChange={set("name")} error={errors.name} autoFocus />
        <Field label="Work email" type="email" placeholder="ada@company.com" value={form.email} onChange={set("email")} error={errors.email} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company" placeholder="Acme Inc." value={form.company} onChange={set("company")} error={errors.company} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-navy-900">Team size</span>
          <select value={form.size} onChange={set("size")} className={cn(inputCls(), "cursor-pointer")}>
            {["1–10", "11–50", "51–200", "200+"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy-900">What would you like to see?</span>
        <textarea
          rows={3}
          placeholder="e.g. automations for our support team…"
          value={form.notes}
          onChange={set("notes")}
          className={cn(inputCls(), "resize-none")}
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="btn-sheen btn-lift flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-5 py-3 text-sm font-semibold text-mist-50 shadow-soft hover:bg-primary-600 disabled:cursor-wait disabled:opacity-80"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request my demo"}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </button>
      {submitError && <p role="alert" className="text-sm text-rose-600">{submitError}</p>}
    </form>
  );
}

/** Dialog Contact Sales. */
function ContactModal({ onClose }: { onClose: () => void }) {
  const ui = useUI();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = "Please enter your name.";
    if (!EMAIL_RE.test(form.email)) errs.email = "Please enter a valid email.";
    if (form.message.trim().length < 10) errs.message = "Tell us a little more (10+ characters).";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitError("");
    setLoading(true);
    try {
      await createLead({
        leadType: "contact",
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setDone(true);
      ui.toast("Message sent — our sales team will reply shortly.");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <SuccessView
        title="Message sent!"
        note="Thanks for reaching out. A FlowSaaS specialist will get back to you within one business day."
        onDone={onClose}
      />
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Full name"
          placeholder="Ada Lovelace"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          error={errors.name}
          autoFocus
        />
        <Field
          label="Work email"
          type="email"
          placeholder="ada@company.com"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          error={errors.email}
        />
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy-900">How can we help?</span>
        <textarea
          rows={4}
          placeholder="Tell us about your team, your workflows, and what you'd like to achieve…"
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className={cn(
            "w-full resize-none rounded-lg border bg-white px-3.5 py-2.5 text-sm text-navy-900 outline-none transition-all duration-300 placeholder:text-ink-300 focus:border-primary-400 focus:ring-4 focus:ring-primary-100",
            errors.message ? "border-rose-400" : "border-line-200"
          )}
        />
        {errors.message && (
          <span className="mt-1.5 block text-xs font-medium text-rose-500">{errors.message}</span>
        )}
      </label>
      <button
        type="submit"
        disabled={loading}
        className="btn-sheen btn-lift flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-5 py-3 text-sm font-semibold text-mist-50 shadow-soft hover:bg-primary-600 disabled:cursor-wait disabled:opacity-80"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send message"}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </button>
      {submitError && <p role="alert" className="text-sm text-rose-600">{submitError}</p>}
      <p className="text-center text-xs text-ink-400">
        Prefer email? <a href="mailto:sales@flowsaas.io" className="font-semibold text-primary-500 hover:text-primary-600">sales@flowsaas.io</a>
      </p>
    </form>
  );
}

/** Dialog Pricing lengkap dengan toggle Monthly/Annual. */
function PricingModal({ onClose }: { onClose: () => void }) {
  const ui = useUI();
  const [annual, setAnnual] = useState(true);

  const price = (monthly: number) => (annual ? Math.round(monthly * 0.8) : monthly);

  return (
    <div>
      {/* Toggle billing */}
      <div className="mx-auto mb-8 grid w-fit grid-cols-2 rounded-lg border border-line-200 bg-mist-50 p-1">
        {(["Monthly", "Annual"] as const).map((label, i) => {
          const active = (i === 1) === annual;
          return (
            <button
              key={label}
              onClick={() => setAnnual(i === 1)}
              className={cn(
                "relative rounded-md px-5 py-2 text-sm font-semibold transition-all duration-300",
                active ? "bg-primary-500 text-mist-50 shadow-card" : "text-ink-500 hover:text-navy-900"
              )}
            >
              {label}
              {label === "Annual" && (
                <span
                  className={cn(
                    "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    active ? "bg-primary-400/60 text-mist-50" : "bg-primary-100 text-primary-600"
                  )}
                >
                  −20%
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "card-lift flex flex-col rounded-xl border bg-white p-6 shadow-soft",
              plan.popular ? "border-primary-300 ring-4 ring-primary-100" : "border-line-200"
            )}
          >
            {plan.popular && (
              <span className="mb-3 w-fit rounded-full bg-primary-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-mist-50">
                Most popular
              </span>
            )}
            <h4 className="font-display text-lg font-bold text-navy-900">{plan.name}</h4>
            <p className="mt-1 text-sm text-ink-500">{plan.tagline}</p>
            <p className="mt-4 font-display text-4xl font-extrabold text-navy-900">
              {plan.monthly === 0 ? (
                "Custom"
              ) : (
                <>
                  ${price(plan.monthly)}
                  <span className="text-sm font-medium text-ink-400"> /user/mo</span>
                </>
              )}
            </p>
            {plan.monthly > 0 && (
              <p className="mt-1 text-xs text-ink-400">
                {annual ? "billed annually" : "billed monthly"}
              </p>
            )}
            <ul className="mt-5 flex-1 space-y-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-ink-500">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" /> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => {
                onClose();
                if (plan.cta === "contact") ui.open({ kind: "contact" });
                else ui.open({ kind: "auth", mode: "signup" });
              }}
              className={cn(
                "btn-lift mt-6 rounded-lg px-5 py-3 text-center text-sm font-semibold",
                plan.popular
                  ? "btn-sheen bg-primary-500 text-mist-50 shadow-soft hover:bg-primary-600"
                  : "border border-ink-300/60 text-navy-900 hover:border-primary-400 hover:text-primary-600"
              )}
            >
              {plan.cta === "contact" ? "Contact Sales" : "Start Free Trial"}
            </button>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-ink-400">
        All plans include a 14-day free trial · No credit card required · Cancel anytime
      </p>
    </div>
  );
}

/** Dialog detail satu fitur (dibuka dari kartu Features / menu navbar). */
function FeatureModal({ feature, onClose }: { feature: Feature; onClose: () => void }) {
  const ui = useUI();
  return (
    <div>
      <span className="grid h-14 w-14 place-items-center rounded-xl bg-primary-50 text-primary-500">
        <feature.icon className="h-6 w-6" />
      </span>
      <p className="mt-5 leading-relaxed text-ink-500">{feature.desc}</p>
      <ul className="mt-6 space-y-3">
        {feature.bullets.map((b) => (
          <li key={b} className="flex items-start gap-3 rounded-lg border border-line-200 bg-mist-50 px-4 py-3 text-sm font-medium text-navy-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
            {b}
          </li>
        ))}
      </ul>
      <div className="mt-7 flex flex-wrap gap-3">
        <button
          onClick={() => {
            onClose();
            ui.open({ kind: "auth", mode: "signup" });
          }}
          className="btn-sheen btn-lift inline-flex items-center gap-2 rounded-lg bg-primary-500 px-6 py-3 text-sm font-semibold text-mist-50 shadow-soft hover:bg-primary-600"
        >
          Try it free <ArrowRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            onClose();
            ui.open({ kind: "demo" });
          }}
          className="btn-lift inline-flex items-center gap-2 rounded-lg border border-ink-300/60 px-6 py-3 text-sm font-semibold text-navy-900 hover:border-primary-300 hover:text-primary-600"
        >
          <Play className="h-4 w-4 text-primary-500" /> See it in a demo
        </button>
      </div>
    </div>
  );
}

/* ---------- Konten halaman info (Help, Guides, API, dll.) ---------- */

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-line-200 bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-navy-900 transition-colors hover:text-primary-600"
      >
        {q}
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-primary-500 transition-transform duration-300", open && "rotate-180")} />
      </button>
      <div className={cn("grid transition-[grid-template-rows] duration-300 ease-out-expo", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <p className="px-5 pb-4 text-sm leading-relaxed text-ink-500">{a}</p>
        </div>
      </div>
    </div>
  );
}

function CopyBlock() {
  const ui = useUI();
  const snippet = `curl -H "Authorization: Bearer $FLOW_TOKEN" \\
  https://api.flowsaas.io/v1/tasks?status=in_progress`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      ui.toast("Snippet copied to clipboard.");
    } catch {
      ui.toast("Copy failed — please select the text manually.");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-navy-900 p-5">
      <button
        onClick={copy}
        className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-semibold text-ink-300 transition-all duration-300 hover:border-primary-400 hover:text-mist-50"
      >
        <Copy className="h-3.5 w-3.5" /> Copy
      </button>
      <pre className="overflow-x-auto pr-20 font-mono text-xs leading-relaxed text-primary-200">
        <code>{snippet}</code>
      </pre>
    </div>
  );
}

function InfoContent({ page }: { page: InfoKey }) {
  const ui = useUI();

  switch (page) {
    case "integrations": {
      const items = [
        ["Slack", "Notifications"], ["Google Drive", "Files"], ["Zapier", "Automation"],
        ["Figma", "Design"], ["GitHub", "Dev tools"], ["Notion", "Docs"],
        ["Zoom", "Meetings"], ["Salesforce", "CRM"],
      ];
      return (
        <div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {items.map(([name, cat]) => (
              <div key={name} className="card-lift rounded-xl border border-line-200 bg-white p-4 text-center shadow-soft">
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-lg bg-primary-50 font-display text-sm font-bold text-primary-500">
                  {name[0]}
                </span>
                <p className="mt-2.5 text-sm font-bold text-navy-900">{name}</p>
                <p className="text-[11px] text-ink-400">{cat}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => ui.toast("Thanks! We'll notify you when it ships.")}
            className="btn-lift mt-6 w-full rounded-lg border border-ink-300/60 px-5 py-3 text-sm font-semibold text-navy-900 hover:border-primary-400 hover:text-primary-600"
          >
            Request a new integration
          </button>
        </div>
      );
    }
    case "changelog": {
      const entries = [
        { v: "v2.4.0", date: "Jun 12, 2024", tag: "New", text: "Workflow branching, dark mode for dashboards, and 3× faster board loading." },
        { v: "v2.3.2", date: "May 28, 2024", tag: "Improved", text: "Bulk task editing, smarter @mention suggestions, and CSV export filters." },
        { v: "v2.3.0", date: "May 9, 2024", tag: "New", text: "Advanced analytics: custom funnels, cohort retention, and scheduled reports." },
        { v: "v2.2.1", date: "Apr 22, 2024", tag: "Fixed", text: "SSO session refresh, notification grouping, and mobile keyboard focus." },
      ];
      return (
        <ol className="space-y-4">
          {entries.map((e) => (
            <li key={e.v} className="rounded-xl border border-line-200 bg-white p-5 shadow-soft">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-md bg-navy-900 px-2 py-1 font-mono text-[11px] font-bold text-primary-200">{e.v}</span>
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                  e.tag === "New" ? "bg-primary-100 text-primary-700" : e.tag === "Fixed" ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-600"
                )}>
                  {e.tag}
                </span>
                <span className="text-xs text-ink-400">{e.date}</span>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-500">{e.text}</p>
            </li>
          ))}
        </ol>
      );
    }
    case "help":
      return (
        <div className="space-y-3">
          {[
            ["How does the 14-day trial work?", "Every new workspace gets full Business features for 14 days — no credit card required. When the trial ends you can pick a plan or continue free with up to 3 seats."],
            ["Can I change plans later?", "Anytime. Upgrades apply immediately with prorated billing; downgrades take effect at the next billing cycle."],
            ["Is my data secure?", "Yes. FlowSaaS is SOC 2 Type II certified, encrypts data in transit (TLS 1.3) and at rest (AES-256), and offers SSO, 2FA, and audit logs."],
            ["Do you offer discounts?", "Annual billing saves 20%. Nonprofits and education teams get 40% off — contact sales to apply."],
            ["How do I import from other tools?", "One-click importers for Asana, Trello, Jira, and Notion live in Settings → Import. CSV import works for everything else."],
          ].map(([q, a]) => (
            <Faq key={q} q={q} a={a} />
          ))}
        </div>
      );
    case "guides": {
      const guides = [
        { t: "Getting started in 10 minutes", d: "Set up your first workspace, invite the team, and ship a workflow.", time: "10 min", level: "Beginner" },
        { t: "Automating your first process", d: "A step-by-step walkthrough of triggers, actions, and conditions.", time: "15 min", level: "Beginner" },
        { t: "Dashboards that drive decisions", d: "Choose the right metrics and layout for exec reporting.", time: "20 min", level: "Intermediate" },
        { t: "Scaling permissions across teams", d: "Roles, groups, and guest access patterns that stay tidy at 500+ seats.", time: "25 min", level: "Advanced" },
      ];
      return (
        <div className="space-y-3">
          {guides.map((g) => (
            <button
              key={g.t}
              onClick={() => ui.toast(`Opening “${g.t}”…`)}
              className="card-lift flex w-full items-center gap-4 rounded-xl border border-line-200 bg-white p-5 text-left shadow-soft hover:border-primary-200"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-500">
                <ListTodo className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-sm font-bold text-navy-900">{g.t}</span>
                <span className="mt-0.5 block truncate text-xs text-ink-500">{g.d}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-xs font-bold text-primary-500">{g.time}</span>
                <span className="block text-[11px] text-ink-400">{g.level}</span>
              </span>
            </button>
          ))}
        </div>
      );
    }
    case "webinars": {
      const webinars = [
        { t: "Workflow Automation Masterclass", d: "Live build: invoice processing from email to ERP.", date: "Jul 18 · 10:00 AM PT" },
        { t: "Metrics That Matter for SaaS Teams", d: "How top teams structure their reporting cadence.", date: "Jul 25 · 1:00 PM PT" },
        { t: "Migrating from Spreadsheets, Painlessly", d: "A real migration, done live, with Q&A.", date: "Aug 1 · 9:00 AM PT" },
      ];
      return (
        <div className="space-y-3">
          {webinars.map((w) => (
            <div key={w.t} className="flex flex-wrap items-center gap-4 rounded-xl border border-line-200 bg-white p-5 shadow-soft">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary-500 font-display text-xs font-bold text-mist-50">
                {w.date.split(" ")[1]?.replace("·", "") ?? ""}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-sm font-bold text-navy-900">{w.t}</span>
                <span className="mt-0.5 block text-xs text-ink-500">{w.d}</span>
                <span className="mt-1 block text-[11px] font-semibold text-primary-500">{w.date}</span>
              </span>
              <button
                onClick={() => ui.toast("Seat reserved — calendar invite sent!")}
                className="btn-lift shrink-0 rounded-lg bg-primary-500 px-4 py-2.5 text-xs font-semibold text-mist-50 shadow-soft hover:bg-primary-600"
              >
                Register
              </button>
            </div>
          ))}
        </div>
      );
    }
    case "api":
      return (
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-ink-500">
            The FlowSaaS REST API gives you everything the UI can do. Authenticate with a bearer
            token from <span className="font-semibold text-navy-900">Settings → API</span>.
          </p>
          <CopyBlock />
          <ul className="space-y-2">
            {[
              ["GET", "/v1/tasks", "List & filter tasks"],
              ["POST", "/v1/workflows/:id/run", "Trigger a workflow"],
              ["GET", "/v1/reports/export", "Download a report"],
            ].map(([m, path, d]) => (
              <li key={path} className="flex items-center gap-3 rounded-lg border border-line-200 bg-mist-50 px-4 py-2.5">
                <span className={cn(
                  "rounded px-1.5 py-0.5 font-mono text-[10px] font-bold",
                  m === "GET" ? "bg-emerald-50 text-emerald-600" : "bg-primary-100 text-primary-700"
                )}>
                  {m}
                </span>
                <code className="font-mono text-xs text-navy-900">{path}</code>
                <span className="ml-auto text-xs text-ink-400">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case "about":
      return (
        <div className="space-y-6">
          <p className="leading-relaxed text-ink-500">
            FlowSaaS started in 2021 when four operators got tired of duct-taping tools together.
            Today, 4,000+ teams plan, automate, and report in one connected workspace — and we're
            just getting started.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              ["4,000+", "teams onboard"],
              ["38M", "tasks automated / mo"],
              ["99.99%", "uptime SLA"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-xl border border-line-200 bg-mist-50 p-4 text-center">
                <p className="font-display text-2xl font-extrabold text-primary-500">{v}</p>
                <p className="mt-1 text-[11px] font-medium text-ink-400">{l}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case "careers": {
      const jobs = [
        { t: "Senior Frontend Engineer", d: "Remote · Full-time" },
        { t: "Product Designer, Workflows", d: "Remote · Full-time" },
        { t: "Developer Advocate", d: "Remote · Full-time" },
        { t: "Enterprise Account Executive", d: "New York · Full-time" },
      ];
      return (
        <div className="space-y-3">
          {jobs.map((j) => (
            <div key={j.t} className="flex flex-wrap items-center gap-4 rounded-xl border border-line-200 bg-white p-5 shadow-soft">
              <span className="min-w-0 flex-1">
                <span className="block font-display text-sm font-bold text-navy-900">{j.t}</span>
                <span className="mt-0.5 block text-xs text-ink-400">{j.d}</span>
              </span>
              <button
                onClick={() => ui.toast(`Application started for “${j.t}”.`)}
                className="btn-lift shrink-0 rounded-lg border border-ink-300/60 px-4 py-2.5 text-xs font-semibold text-navy-900 hover:border-primary-400 hover:text-primary-600"
              >
                Apply →
              </button>
            </div>
          ))}
          <p className="text-center text-xs text-ink-400">Don't see your role? Email <a className="font-semibold text-primary-500" href="mailto:careers@flowsaas.io">careers@flowsaas.io</a></p>
        </div>
      );
    }
    case "blog": {
      const posts = [
        { t: "The anatomy of a workflow that never breaks", tag: "Engineering", date: "Jun 2024" },
        { t: "Why we killed our status meetings", tag: "Culture", date: "May 2024" },
        { t: "Benchmarks: how fast teams ship on FlowSaaS", tag: "Research", date: "Apr 2024" },
      ];
      return (
        <div className="space-y-3">
          {posts.map((p) => (
            <button
              key={p.t}
              onClick={() => ui.toast(`Opening “${p.t}”…`)}
              className="card-lift flex w-full items-center gap-4 rounded-xl border border-line-200 bg-white p-5 text-left shadow-soft hover:border-primary-200"
            >
              <span className="min-w-0 flex-1">
                <span className="mb-1.5 block w-fit rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-600">{p.tag}</span>
                <span className="block font-display text-sm font-bold text-navy-900">{p.t}</span>
                <span className="mt-0.5 block text-xs text-ink-400">{p.date}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-primary-400" />
            </button>
          ))}
        </div>
      );
    }
    case "privacy":
    case "terms":
      return (
        <div className="space-y-4 text-sm leading-relaxed text-ink-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-300">Last updated: June 1, 2024</p>
          {page === "privacy" ? (
            <>
              <p><strong className="text-navy-900">1. What we collect.</strong> Account details (name, email), workspace content you create, and product analytics that help us improve FlowSaaS. We never sell personal data.</p>
              <p><strong className="text-navy-900">2. How we use it.</strong> To operate the service, keep it secure, and send the communications you opt into. Marketing emails always include one-click unsubscribe.</p>
              <p><strong className="text-navy-900">3. Your rights.</strong> You can export or permanently delete your data at any time from Settings → Data, or by emailing privacy@flowsaas.io. GDPR and CCPA requests are honored within 30 days.</p>
              <p><strong className="text-navy-900">4. Security.</strong> Data is encrypted in transit (TLS 1.3) and at rest (AES-256). We maintain SOC 2 Type II certification and run annual third-party penetration tests.</p>
            </>
          ) : (
            <>
              <p><strong className="text-navy-900">1. The service.</strong> FlowSaaS provides a collaborative workflow platform. Your content remains yours; you grant us only the license needed to host and display it to people you authorize.</p>
              <p><strong className="text-navy-900">2. Acceptable use.</strong> Don't use the service for anything unlawful, and don't attempt to disrupt, reverse-engineer, or resell it without agreement.</p>
              <p><strong className="text-navy-900">3. Billing.</strong> Paid plans renew automatically until cancelled. Annual plans are billed upfront; monthly plans at each cycle. Fees are non-refundable except where required by law.</p>
              <p><strong className="text-navy-900">4. Liability.</strong> The service is provided "as is". Our aggregate liability is limited to the amounts you paid in the 12 months before the claim.</p>
            </>
          )}
          <p className="border-t border-line-200 pt-4 text-xs text-ink-400">
            Questions? Contact <a href="mailto:legal@flowsaas.io" className="font-semibold text-primary-500">legal@flowsaas.io</a>
          </p>
        </div>
      );
  }
}

const INFO_TITLES: Record<InfoKey, [string, string]> = {
  integrations: ["Integrations", "Connect FlowSaaS to the tools you already use."],
  changelog: ["Changelog", "What we've shipped recently."],
  help: ["Help Center", "Quick answers to the most common questions."],
  guides: ["Guides", "Step-by-step playbooks from the FlowSaaS team."],
  webinars: ["Webinars", "Live sessions — free for everyone."],
  api: ["API Docs", "Build on FlowSaaS with a simple REST API."],
  about: ["About Us", "The story behind FlowSaaS."],
  careers: ["Careers", "Help us build the future of work. Remote-first."],
  blog: ["Blog", "Notes on workflows, metrics, and team ops."],
  privacy: ["Privacy Policy", "How we handle your data — in plain language."],
  terms: ["Terms of Service", "The rules of the road for using FlowSaaS."],
};

/** Router dialog — memutuskan modal mana yang tampil. */
function ModalHost({ modal, onClose }: { modal: ModalState | null; onClose: () => void }) {
  if (!modal) return null;

  switch (modal.kind) {
    case "auth":
      return (
        <Modal
          title={modal.mode === "signup" ? "Start your free trial" : "Welcome back"}
          subtitle={modal.mode === "signup" ? "14 days of Business, on us." : "Sign in to your workspace."}
          onClose={onClose}
        >
          <AuthModal initialMode={modal.mode} onClose={onClose} />
        </Modal>
      );
    case "demo":
      return (
        <Modal title="Request a Demo" subtitle="30 minutes with a product specialist — tailored to your team." onClose={onClose}>
          <DemoModal onClose={onClose} />
        </Modal>
      );
    case "contact":
      return (
        <Modal title="Contact Sales" subtitle="Tell us about your organization and we'll craft a plan." onClose={onClose}>
          <ContactModal onClose={onClose} />
        </Modal>
      );
    case "pricing":
      return (
        <Modal title="Simple, transparent pricing" subtitle="Start free. Upgrade when your team is ready." onClose={onClose} size="lg">
          <PricingModal onClose={onClose} />
        </Modal>
      );
    case "feature":
      return (
        <Modal title={modal.feature.title} subtitle="What's included" onClose={onClose}>
          <FeatureModal feature={modal.feature} onClose={onClose} />
        </Modal>
      );
    case "info": {
      const [title, subtitle] = INFO_TITLES[modal.page];
      return (
        <Modal title={title} subtitle={subtitle} onClose={onClose} size={modal.page === "privacy" || modal.page === "terms" ? "md" : "lg"}>
          <InfoContent page={modal.page} />
        </Modal>
      );
    }
  }
}

/* ============================================================
   1. NAVBAR — semua item terhubung (dropdown, auth, anchor)
   ============================================================ */

function Navbar() {
  const ui = useUI();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<null | "features" | "resources">(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const linkCls =
    "link-underline text-sm font-medium text-navy-800 transition-colors hover:text-primary-500";

  const Dropdown = ({
    menu,
    label,
    children,
  }: {
    menu: "features" | "resources";
    label: string;
    children: ReactNode;
  }) => (
    <li className="relative">
      <button
        onClick={() => setOpenMenu(openMenu === menu ? null : menu)}
        className={cn(
          "link-underline flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary-500",
          openMenu === menu ? "text-primary-500" : "text-navy-800"
        )}
        aria-expanded={openMenu === menu}
      >
        {label}
        <ChevronDown
          className={cn("h-4 w-4 transition-transform duration-300", openMenu === menu && "rotate-180")}
        />
      </button>
      <div
        className={cn(
          "absolute left-1/2 top-full -translate-x-1/2 pt-3 transition-all duration-300",
          openMenu === menu ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
        )}
      >
        {children}
      </div>
    </li>
  );

  return (
    <header
      ref={navRef}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-line-200 bg-white/90 shadow-soft backdrop-blur-md"
          : "border-b border-transparent bg-mist-50/70 backdrop-blur-sm"
      )}
    >
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo />

        {/* Menu desktop */}
        <ul className="hidden items-center gap-8 lg:flex">
          <Dropdown menu="features" label="Features">
            <div className="w-64 rounded-xl border border-line-200 bg-white p-2 shadow-lift">
              {FEATURES.slice(0, 4).map((f) => (
                <button
                  key={f.title}
                  onClick={() => {
                    setOpenMenu(null);
                    ui.open({ kind: "feature", feature: f });
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-200 hover:bg-primary-50"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-500">
                    <f.icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-navy-800">{f.title}</span>
                </button>
              ))}
            </div>
          </Dropdown>

          <li>
            <a href="#pricing" className={linkCls}>
              Pricing
            </a>
          </li>

          <Dropdown menu="resources" label="Resources">
            <div className="w-52 rounded-xl border border-line-200 bg-white p-2 shadow-lift">
              {RESOURCES_LINKS.map((r) => (
                <button
                  key={r.label}
                  onClick={() => {
                    setOpenMenu(null);
                    ui.open({ kind: "info", page: r.page });
                  }}
                  className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-navy-800 transition-colors duration-200 hover:bg-primary-50 hover:text-primary-600"
                >
                  {r.label}
                </button>
              ))}
            </div>
          </Dropdown>

          <li>
            <button onClick={() => ui.open({ kind: "auth", mode: "signin" })} className={linkCls}>
              Sign in
            </button>
          </li>
          <li>
            <button
              onClick={() => ui.open({ kind: "auth", mode: "signup" })}
              className="btn-sheen btn-lift inline-flex items-center gap-2 rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-semibold text-mist-50 shadow-soft hover:bg-primary-600"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </button>
          </li>
        </ul>

        {/* Hamburger (mobile) */}
        <button
          className="grid h-10 w-10 place-items-center rounded-lg border border-line-200 bg-white text-navy-800 transition-colors hover:border-primary-300 lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Panel menu mobile */}
      <div
        className={cn(
          "overflow-hidden border-b border-line-200 bg-white transition-all duration-300 lg:hidden",
          mobileOpen ? "max-h-[calc(100vh-72px)] overflow-y-auto shadow-lift" : "max-h-0 border-b-0"
        )}
      >
        <div className="space-y-5 px-5 py-6">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-300">Features</p>
            <div className="grid grid-cols-2 gap-2">
              {FEATURES.slice(0, 4).map((f) => (
                <button
                  key={f.title}
                  onClick={() => {
                    setMobileOpen(false);
                    ui.open({ kind: "feature", feature: f });
                  }}
                  className="flex items-center gap-2 rounded-lg border border-line-200 px-3 py-2.5 text-left text-sm font-medium text-navy-800 transition-colors hover:border-primary-300 hover:bg-primary-50"
                >
                  <f.icon className="h-4 w-4 shrink-0 text-primary-500" />
                  <span className="leading-tight">{f.title}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-300">Resources</p>
            <div className="grid grid-cols-2 gap-2">
              {RESOURCES_LINKS.map((r) => (
                <button
                  key={r.label}
                  onClick={() => {
                    setMobileOpen(false);
                    ui.open({ kind: "info", page: r.page });
                  }}
                  className="rounded-lg border border-line-200 px-3 py-2.5 text-left text-sm font-medium text-navy-800 transition-colors hover:border-primary-300 hover:bg-primary-50"
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 border-t border-line-200 pt-5">
            <button
              onClick={() => {
                setMobileOpen(false);
                ui.open({ kind: "auth", mode: "signin" });
              }}
              className="btn-lift flex-1 rounded-lg border border-line-200 px-4 py-3 text-center text-sm font-semibold text-navy-800 hover:border-primary-300"
            >
              Sign in
            </button>
            <button
              onClick={() => {
                setMobileOpen(false);
                ui.open({ kind: "auth", mode: "signup" });
              }}
              className="btn-lift flex-1 rounded-lg bg-primary-500 px-4 py-3 text-center text-sm font-semibold text-mist-50 hover:bg-primary-600"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ============================================================
   2. HERO — mockup laptop INTERAKTIF (5 tab) + tablet live chart
   ============================================================ */

type DashTab = "dashboard" | "workflows" | "tasks" | "reports" | "settings";

function LaptopDashboard({ inView }: { inView: boolean }) {
  const users = useCountUp(1250, inView);
  const tasks = useCountUp(320, inView);
  const efficiency = useCountUp(78, inView);
  const [tab, setTab] = useState<DashTab>("dashboard");

  /* Activity feed yang terus bertambah (elemen hidup) */
  const idRef = useRef(2);
  const [feed, setFeed] = useState(() =>
    ACTIVITY_POOL.slice(0, 3).map((a, i) => ({ ...a, id: i, mins: [2, 18, 64][i] }))
  );
  useEffect(() => {
    const t = setInterval(() => {
      setFeed((prev) => {
        idRef.current += 1;
        const next = ACTIVITY_POOL[idRef.current % ACTIVITY_POOL.length];
        const aged = prev.map((it) => ({ ...it, mins: Math.min(it.mins + 3, 59) }));
        return [{ ...next, id: idRef.current, mins: 0 }, ...aged].slice(0, 3);
      });
    }, 4000);
    return () => clearInterval(t);
  }, []);

  /* Task checklist interaktif */
  const [miniTasks, setMiniTasks] = useState(MINI_TASKS);
  const doneCount = miniTasks.filter((t) => t.done).length;

  const [flows, setFlows] = useState([true, true, false]);
  const [prefs, setPrefs] = useState([true, false, true]);

  const stats = [
    { label: "Active Users", value: users.toLocaleString("en-US"), delta: "+12.4%" },
    { label: "Tasks Done", value: tasks.toLocaleString("en-US"), delta: "+8.1%" },
    { label: "Efficiency", value: `${efficiency}%`, delta: "+4.6%" },
  ];

  const sidebarItems: { icon: LucideIcon; label: string; tab: DashTab }[] = [
    { icon: LayoutDashboard, label: "Dashboard", tab: "dashboard" },
    { icon: Workflow, label: "Workflows", tab: "workflows" },
    { icon: ListTodo, label: "Tasks", tab: "tasks" },
    { icon: BarChart3, label: "Reports", tab: "reports" },
    { icon: Settings, label: "Settings", tab: "settings" },
  ];

  const fmt = (mins: number) => (mins === 0 ? "now" : `${mins}m`);

  return (
    <div className="flex h-[300px] text-navy-900 sm:h-[340px]">
      {/* Sidebar gelap — bisa diklik untuk pindah tab */}
      <aside className="flex w-[27%] flex-col gap-1 bg-navy-800 p-2.5">
        <div className="mb-2 flex items-center gap-1.5 px-1">
          <LogoMark className="h-5 w-5 text-primary-400" />
          <span className="font-display text-[10px] font-bold text-mist-50">Flow</span>
        </div>
        {sidebarItems.map((item) => (
          <button
            key={item.tab}
            onClick={() => setTab(item.tab)}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[9px] font-medium transition-colors duration-200",
              tab === item.tab ? "bg-primary-500 text-mist-50" : "text-ink-300 hover:bg-navy-700 hover:text-mist-50"
            )}
          >
            <item.icon className="h-3 w-3 shrink-0" />
            {item.label}
          </button>
        ))}
        <div className="mt-auto flex items-center gap-1.5 rounded-md bg-navy-700 p-1.5">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-primary-400 text-[7px] font-bold text-mist-50">AR</span>
          <span className="text-[8px] font-medium text-mist-50">Amara R.</span>
        </div>
      </aside>

      {/* Area utama — berganti sesuai tab */}
      <div className="flex min-w-0 flex-1 flex-col gap-2.5 bg-mist-50 p-3">
        {/* Topbar */}
        <div className="flex items-center justify-between gap-2">
          <span className="flex h-6 w-2/5 items-center gap-1.5 rounded-full border border-line-200 bg-white px-2.5 text-[8px] text-ink-300">
            <Search className="h-2.5 w-2.5" /> Search…
          </span>
          <span className="flex items-center gap-1.5">
            <span className="relative grid h-6 w-6 place-items-center rounded-full border border-line-200 bg-white text-ink-400">
              <Bell className="h-3 w-3" />
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary-500" />
            </span>
            <span className="grid h-6 w-6 place-items-center rounded-full bg-primary-500 text-[7px] font-bold text-mist-50">JL</span>
          </span>
        </div>

        {tab === "dashboard" && (
          <>
            <div className="grid grid-cols-3 gap-2">
              {stats.map((s) => (
                <div key={s.label} className="rounded-lg border border-line-200 bg-white p-2 shadow-soft">
                  <p className="text-[7.5px] font-semibold uppercase tracking-wide text-ink-300">{s.label}</p>
                  <p className="font-display text-sm font-bold text-navy-900 sm:text-base">{s.value}</p>
                  <p className="flex items-center gap-0.5 text-[7.5px] font-semibold text-emerald-600">
                    <TrendingUp className="h-2 w-2" /> {s.delta}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex-1 rounded-lg border border-line-200 bg-white p-2 shadow-soft">
              <div className="mb-1 flex items-center justify-between px-0.5">
                <p className="text-[9px] font-bold text-navy-900">Recent Activity</p>
                <span className="flex items-center gap-1 text-[8px] font-semibold text-primary-500">
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-emerald-500" /> Live
                </span>
              </div>
              {feed.map((a) => (
                <div key={a.id} className="animate-row-in flex items-center gap-1.5 border-b border-line-200/70 px-0.5 py-[5px] last:border-0">
                  <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-full text-[7px] font-bold text-mist-50", a.tone)}>
                    {a.ini}
                  </span>
                  <p className="truncate text-[8px] text-ink-500">
                    <span className="font-semibold text-navy-900">{a.name}</span> {a.action}
                  </p>
                  <span className="ml-auto shrink-0 text-[7.5px] text-ink-300">{fmt(a.mins)}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "workflows" && (
          <div className="flex flex-1 flex-col gap-1.5">
            {MINI_WORKFLOWS.map((w, i) => (
              <div key={w.name} className="flex items-center gap-2 rounded-lg border border-line-200 bg-white p-2 shadow-soft">
                <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-md", flows[i] ? "bg-primary-500 text-mist-50" : "bg-line-200 text-ink-400")}>
                  <Workflow className="h-3 w-3" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[9px] font-bold text-navy-900">{w.name}</span>
                  <span className="block text-[7.5px] text-ink-400">{w.desc}</span>
                </span>
                <span className="hidden text-[7px] font-semibold sm:block">
                  {flows.filter(Boolean).length} active
                </span>
                <Toggle on={flows[i]} onChange={(v) => setFlows((f) => f.map((x, j) => (j === i ? v : x)))} />
              </div>
            ))}
            <p className="px-0.5 text-[7.5px] text-ink-300">Tip: toggles are real — flip them.</p>
          </div>
        )}

        {tab === "tasks" && (
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="rounded-lg border border-line-200 bg-white p-2 shadow-soft">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-[9px] font-bold text-navy-900">Sprint 14</p>
                <p className="text-[8px] font-semibold text-primary-500">{doneCount}/{miniTasks.length} done</p>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-line-200">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all duration-500 ease-out-expo"
                  style={{ width: `${(doneCount / miniTasks.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              {miniTasks.map((t, i) => (
                <button
                  key={t.label}
                  onClick={() => setMiniTasks((prev) => prev.map((x, j) => (j === i ? { ...x, done: !x.done } : x)))}
                  className="flex w-full cursor-pointer items-center gap-1.5 rounded-lg border border-line-200 bg-white px-2 py-[5px] text-left shadow-soft transition-colors duration-200 hover:border-primary-300"
                >
                  <span
                    className={cn(
                      "grid h-3.5 w-3.5 shrink-0 place-items-center rounded border-[1.5px] transition-all duration-200",
                      t.done ? "border-primary-500 bg-primary-500 text-mist-50" : "border-ink-300 bg-white"
                    )}
                  >
                    {t.done && <Check className="h-2 w-2" />}
                  </span>
                  <span className={cn("truncate text-[8.5px] font-medium transition-all duration-200", t.done ? "text-ink-300 line-through" : "text-navy-900")}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "reports" && (
          <div className="flex flex-1 flex-col justify-center gap-2 rounded-lg border border-line-200 bg-white p-2.5 shadow-soft">
            {[
              { label: "Revenue", v: 82, delta: "+14%" },
              { label: "Retention", v: 91, delta: "+3%" },
              { label: "NPS", v: 64, delta: "+9%" },
            ].map((m, i) => (
              <div key={m.label}>
                <div className="mb-1 flex items-center justify-between text-[8px]">
                  <span className="font-bold text-navy-900">{m.label}</span>
                  <span className="font-semibold text-emerald-600">{m.delta}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-line-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-1000 ease-out-expo"
                    style={{ width: inView ? `${m.v}%` : "8%", transitionDelay: `${i * 150}ms` }}
                  />
                </div>
              </div>
            ))}
            <p className="text-[7.5px] text-ink-300">Live metrics · refreshed 30s ago</p>
          </div>
        )}

        {tab === "settings" && (
          <div className="flex flex-1 flex-col gap-1.5">
            {MINI_SETTINGS.map((s, i) => (
              <div key={s} className="flex items-center justify-between gap-2 rounded-lg border border-line-200 bg-white px-2.5 py-2 shadow-soft">
                <span className="text-[9px] font-semibold text-navy-900">{s}</span>
                <Toggle on={prefs[i]} onChange={(v) => setPrefs((p) => p.map((x, j) => (j === i ? v : x)))} />
              </div>
            ))}
            <p className="px-0.5 text-[7.5px] text-ink-300">Preferences sync across devices instantly.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Tablet: grafik batang yang berganti dataset secara berkala. */
function TabletChart({ inView }: { inView: boolean }) {
  const [di, setDi] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDi((v) => (v + 1) % CHART_SETS.length), 4500);
    return () => clearInterval(t);
  }, []);

  const d = CHART_SETS[di];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const max = Math.max(...d.bars);

  return (
    <div className="rounded-[18px] border border-navy-700 bg-navy-800 p-1.5 shadow-pop">
      <div className="rounded-[13px] bg-white p-3">
        <div className="mb-2 flex items-center justify-between">
          <p key={d.label} className="animate-fade-in text-[10px] font-bold text-navy-900">{d.label}</p>
          <span key={d.delta} className="animate-fade-in rounded-full bg-primary-50 px-1.5 py-0.5 text-[8px] font-bold text-primary-600">
            {d.delta}
          </span>
        </div>
        <div className="flex h-20 items-end gap-1.5 sm:h-24">
          {d.bars.map((h, i) => (
            <div
              key={i}
              className={cn("flex-1 rounded-t-[4px]", h === max ? "bg-primary-500" : "bg-primary-200")}
              style={{
                height: inView ? `${h}%` : "0%",
                transition: "height 0.8s var(--ease-out-expo)",
                transitionDelay: `${i * 60}ms`,
              }}
            />
          ))}
        </div>
        <div className="mt-1.5 flex gap-1.5 border-t border-line-200 pt-1">
          {days.map((day, i) => (
            <span key={i} className="flex-1 text-center text-[7px] font-medium text-ink-300">{day}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroTitle() {
  const { ref, inView } = useInView<HTMLHeadingElement>(0.3);
  const lines: { text: string; accent?: boolean }[] = [
    { text: "Simplify Work." },
    { text: "Boost Productivity." },
    { text: "Grow Faster.", accent: true },
  ];

  return (
    <h1
      ref={ref}
      className={cn(
        "font-display text-[2.55rem] font-extrabold leading-[1.06] tracking-tight text-navy-900 sm:text-5xl xl:text-[3.5rem]",
        inView && "is-visible"
      )}
    >
      {lines.map((line, i) => (
        <span key={line.text} className="mask-line">
          <span
            className={cn(line.accent && "text-primary-500")}
            style={{ "--reveal-delay": `${i * 130}ms` } as CSSProperties}
          >
            {line.text}
          </span>
        </span>
      ))}
    </h1>
  );
}

function Hero() {
  const ui = useUI();
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  const tiltRef = useTilt(5);

  return (
    <section id="top" className="relative overflow-hidden pb-28 pt-32 sm:pt-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(91,79,207,0.13) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse 90% 70% at 70% 20%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 70% 20%, black 30%, transparent 75%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-[-8rem] h-[30rem] w-[30rem] rounded-full bg-primary-200/45 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2 lg:gap-10">
        {/* ---- Kiri: copy ---- */}
        <div>
          <HeroTitle />
          <Reveal delay={120}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-500">
              All-in-one SaaS platform to streamline your workflows, collaborate
              with your team, and achieve more every day.
            </p>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => ui.open({ kind: "auth", mode: "signup" })}
                className="btn-sheen btn-lift inline-flex items-center gap-2 rounded-lg bg-primary-500 px-7 py-3.5 text-sm font-semibold text-mist-50 shadow-soft hover:bg-primary-600"
              >
                Start Your Free Trial
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => ui.open({ kind: "demo" })}
                className="btn-lift inline-flex items-center gap-2 rounded-lg border border-ink-300/60 bg-white px-7 py-3.5 text-sm font-semibold text-navy-900 hover:border-primary-300 hover:text-primary-600"
              >
                <Play className="h-4 w-4 text-primary-500" />
                Request a Demo
              </button>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <p className="mt-5 flex items-center gap-2 text-sm text-ink-400">
              <CheckCircle2 className="h-4 w-4 text-primary-500" />
              No credit card required.
            </p>
          </Reveal>
        </div>

        {/* ---- Kanan: mockup interaktif ---- */}
        <div ref={ref} className="relative mx-auto w-full max-w-[560px] pb-10 lg:pb-0">
          <div ref={tiltRef} className="relative will-change-transform">
            {/* Bentuk lengkung gradasi indigo di belakang mockup */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-[54%] rotate-12 animate-blob-late bg-gradient-to-br from-primary-400 via-primary-500 to-primary-800 shadow-pop sm:h-[30rem] sm:w-[30rem]"
            />
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[27rem] w-[27rem] -translate-x-1/2 -translate-y-[52%] animate-spin-slower rounded-[45%_55%_48%_52%/55%_48%_52%_45%] border-2 border-dashed border-primary-300/60 sm:h-[33rem] sm:w-[33rem]"
            />

            {/* Laptop */}
            <div className="relative z-10 mx-auto w-full max-w-[520px] transition-transform duration-500 hover:-translate-y-1.5">
              <div className="rounded-t-[18px] border border-navy-700 bg-navy-800 p-2 shadow-pop">
                <div className="flex items-center gap-1.5 px-1.5 pb-2">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
                <div className="overflow-hidden rounded-[10px]">
                  <LaptopDashboard inView={inView} />
                </div>
              </div>
              <div className="relative mx-[-7%] h-[16px] rounded-b-[18px] bg-gradient-to-b from-navy-700 to-navy-900 shadow-lift">
                <div className="absolute left-1/2 top-0 h-[6px] w-24 -translate-x-1/2 rounded-b-lg bg-navy-900/80" />
              </div>
            </div>

            {/* Tablet (menumpuk, grafik live) */}
            <div className="absolute -bottom-2 -left-2 z-20 w-[44%] max-w-[230px] -rotate-3 transition-transform duration-500 hover:rotate-0 sm:-left-10">
              <TabletChart inView={inView} />
            </div>

            {/* Kartu melayang: grafik pai */}
            <div className="absolute -top-7 right-1 z-30 animate-float sm:-right-5">
              <div className="flex items-center gap-2.5 rounded-xl border border-line-200 bg-white p-3 shadow-lift">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-50 text-primary-500">
                  <PieChart className="h-4.5 w-4.5" />
                </span>
                <span>
                  <span className="block text-[11px] font-bold text-navy-900">Reports</span>
                  <span className="block text-[10px] text-ink-400">24 ready to view</span>
                </span>
              </div>
            </div>

            {/* Kartu melayang: checklist */}
            <div className="absolute left-0 top-1/3 z-30 hidden animate-float-late md:block lg:-left-14">
              <div className="rounded-xl border border-line-200 bg-white p-3 shadow-lift">
                <p className="mb-2 text-[10px] font-bold text-navy-900">Sprint checklist</p>
                <div className="space-y-1.5">
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-primary-500" />
                    <span className="h-1.5 w-16 rounded-full bg-line-200" />
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-primary-500" />
                    <span className="h-1.5 w-12 rounded-full bg-line-200" />
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full border-[1.5px] border-ink-300" />
                    <span className="h-1.5 w-14 rounded-full bg-line-200" />
                  </span>
                </div>
                <p className="mt-2 text-[9px] font-semibold text-primary-500">8 of 12 done</p>
              </div>
            </div>

            {/* Kartu melayang: avatar tim */}
            <div className="absolute -bottom-4 right-4 z-30 animate-float-slow sm:right-0">
              <div className="flex items-center gap-2.5 rounded-xl border border-line-200 bg-white py-2.5 pl-3 pr-4 shadow-lift">
                <span className="flex -space-x-2">
                  <InitialsAvatar initials="AR" tone="bg-primary-500" className="h-7 w-7 text-[9px]" />
                  <InitialsAvatar initials="JK" tone="bg-primary-700" className="h-7 w-7 text-[9px]" />
                  <InitialsAvatar initials="PT" tone="bg-navy-800" className="h-7 w-7 text-[9px]" />
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-navy-900">
                  <span className="h-2 w-2 animate-pulse-dot rounded-full bg-emerald-500" />
                  +8 online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   3. TRUSTED BY
   ============================================================ */

function TrustedBy() {
  const logoCls = "lift-sm flex items-center gap-2 text-ink-300 hover:text-navy-800";

  return (
    <section className="border-y border-line-200 bg-white py-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.28em] text-ink-300">
            Trusted by innovative companies
          </p>
        </Reveal>
        <Reveal delay={120}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-14 gap-y-7">
            <span className={cn(logoCls, "text-[1.35rem] font-medium tracking-tight")}>
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                <path d="M12 11v3.6h5.1c-.5 2.3-2.6 3.9-5.1 3.9a5.5 5.5 0 1 1 0-11c1.4 0 2.7.5 3.7 1.4l2.7-2.7A9.4 9.4 0 0 0 12 2.6a9.4 9.4 0 1 0 0 18.8c5.4 0 9-3.8 9-9.2 0-.4 0-.8-.1-1.2H12z" />
              </svg>
              Google
            </span>
            <span className={cn(logoCls, "text-[1.3rem] font-semibold")}>
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                <path d="M9.5 2a2 2 0 0 0-2 2 2 2 0 0 0 2 2h2V4a2 2 0 0 0-2-2zm0 5.5a2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2v-2h-2zM22 9.5a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2h2a2 2 0 0 0 2-2zm-5.5 0a2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0 2 2h2v-2zM14.5 22a2 2 0 0 0 2-2 2 2 0 0 0-2-2h-2v2a2 2 0 0 0 2 2zm0-5.5a2 2 0 0 0 2-2 2 2 0 0 0-2-2 2 2 0 0 0-2 2v2h2zM2 14.5a2 2 0 0 0 2 2 2 2 0 0 0 2-2v-2H4a2 2 0 0 0-2 2zm5.5 0a2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0-2-2h-2v2z" />
              </svg>
              Slack
            </span>
            <span className={cn(logoCls, "text-[1.35rem] font-bold lowercase tracking-tight")}>
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                <path d="M13.5 6.3c0-.9.7-1.2 1.9-1.2 1.6 0 3.7.5 5.3 1.4V2.2A10.2 10.2 0 0 0 15.4 1C11.9 1 9.5 2.8 9.5 5.9c0 4.8 6.6 4 6.6 6.1 0 1-.9 1.4-2.2 1.4-1.9 0-4.4-.8-6.3-1.9v4.4c2.2.9 4.4 1.3 6.3 1.3 3.6 0 6.1-1.8 6.1-4.9C19.9 7.4 13.5 8.3 13.5 6.3z" />
              </svg>
              stripe
            </span>
            <span className={cn(logoCls, "text-[1.3rem] font-semibold")}>
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="3.2" />
                <path d="M12 8.8V4.5M12 4.5a2 2 0 1 0-.01 0M14.8 13.6l4.6 3.4M19.4 17a2 2 0 1 0 .01 0M9.2 13.6l-4.6 3.4M4.6 17a2 2 0 1 1-.01 0" strokeLinecap="round" />
              </svg>
              HubSpot
            </span>
            <span className={cn(logoCls, "text-[1.35rem] font-extrabold lowercase tracking-tight")}>
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                <path d="M4 7.5A2.5 2.5 0 0 0 1.5 10v4A2.5 2.5 0 0 0 4 16.5h8A2.5 2.5 0 0 0 14.5 14v-4A2.5 2.5 0 0 0 12 7.5H4zm17.4 1.6a1 1 0 0 0-1.5.9v.5l-2.4 1.9v1.2l2.4 1.9v.5a1 1 0 0 0 1.5.9 3.6 3.6 0 0 0 0-7.8z" />
              </svg>
              zoom
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   4. FEATURES — kartu bisa diklik → dialog detail fitur
   ============================================================ */

function Features() {
  const ui = useUI();

  return (
    <section id="features" className="relative py-24 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <Eyebrow>Features</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
              Powerful Features Designed for Teams
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-500">
              Everything you need in one place to manage projects, automate
              tasks, and drive results.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <a
              href="#benefits"
              className="btn-sheen btn-lift mt-8 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-6 py-3.5 text-sm font-semibold text-mist-50 shadow-soft hover:bg-primary-600"
            >
              Explore Features
              <ArrowRight className="h-4 w-4" />
            </a>
            <p className="mt-4 text-sm text-ink-400">Free 14-day trial. Cancel anytime.</p>
          </Reveal>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 90}>
              <div className="group card-lift flex h-full flex-col rounded-xl border border-line-200 bg-white p-6 shadow-soft hover:border-primary-200">
                <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary-50 text-primary-500 transition-all duration-300 group-hover:-rotate-3 group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-mist-50">
                  <f.icon className="h-5.5 w-5.5" />
                </span>
                <h3 className="mt-5 font-display text-base font-bold text-navy-900">{f.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{f.desc}</p>
                <button
                  onClick={() => ui.open({ kind: "feature", feature: f })}
                  className="mt-4 flex w-fit cursor-pointer items-center gap-1.5 text-sm font-semibold text-primary-500 transition-colors hover:text-primary-600"
                >
                  Learn more
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   5. BENEFITS
   ============================================================ */

function BenefitDashboard({ inView }: { inView: boolean }) {
  const rows = [
    { ini: "AR", tone: "bg-primary-500", name: "Amara Reyes", task: "Q3 Campaign", prog: 82, status: "On track", pill: "bg-emerald-50 text-emerald-600" },
    { ini: "JK", tone: "bg-primary-700", name: "Jonas Klein", task: "API Redesign", prog: 64, status: "In review", pill: "bg-amber-50 text-amber-600" },
    { ini: "PT", tone: "bg-navy-800", name: "Priya Thakur", task: "Onboarding Flow", prog: 41, status: "At risk", pill: "bg-rose-50 text-rose-600" },
  ];

  return (
    <div className="rounded-2xl border border-line-200 bg-white p-3 shadow-pop sm:p-4">
      <div className="flex overflow-hidden rounded-xl border border-line-200">
        <aside className="hidden w-14 shrink-0 flex-col items-center gap-4 bg-navy-800 py-4 sm:flex">
          <LogoMark className="h-7 w-7 text-primary-400" />
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-500 text-mist-50">
            <LayoutDashboard className="h-4 w-4" />
          </span>
          <ListTodo className="h-4 w-4 text-ink-300" />
          <BarChart3 className="h-4 w-4 text-ink-300" />
          <Users className="h-4 w-4 text-ink-300" />
          <Settings className="mt-auto h-4 w-4 text-ink-300" />
        </aside>

        <div className="min-w-0 flex-1 bg-mist-50 p-4 sm:p-5">
          <div className="rounded-xl border border-line-200 bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-display text-sm font-bold text-navy-900">Project Overview</h4>
                <p className="text-[11px] text-ink-400">Velocity — last 8 weeks</p>
              </div>
              <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[10px] font-bold text-primary-600">
                +24% vs last quarter
              </span>
            </div>
            <svg viewBox="0 0 300 110" className="mt-3 w-full" aria-hidden="true">
              <defs>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5B4FCF" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#5B4FCF" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[22, 44, 66, 88].map((y) => (
                <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#E7E8F2" strokeWidth="1" />
              ))}
              <path
                d="M0,92 C28,84 46,64 76,66 C106,68 124,44 154,48 C184,52 202,28 232,32 C258,35 282,22 300,14 L300,110 L0,110 Z"
                fill="url(#areaFill)"
                style={{ opacity: inView ? 1 : 0, transition: "opacity 1.1s var(--ease-out-expo) 0.9s" }}
              />
              <path
                d="M0,92 C28,84 46,64 76,66 C106,68 124,44 154,48 C184,52 202,28 232,32 C258,35 282,22 300,14"
                fill="none"
                stroke="#5B4FCF"
                strokeWidth="2.5"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1"
                style={{
                  strokeDashoffset: inView ? 0 : 1,
                  transition: "stroke-dashoffset 1.8s var(--ease-out-expo) 0.15s",
                }}
              />
              <g style={{ opacity: inView ? 1 : 0, transition: "opacity 0.7s var(--ease-out-expo) 1.4s" }}>
                {[
                  [76, 66],
                  [154, 48],
                  [232, 32],
                  [300, 14],
                ].map(([cx, cy]) => (
                  <circle key={cx} cx={cx} cy={cy} r="3.5" fill="#FFFFFF" stroke="#5B4FCF" strokeWidth="2" />
                ))}
              </g>
            </svg>
          </div>

          <div className="mt-4 rounded-xl border border-line-200 bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm font-bold text-navy-900">Team Activity</h4>
              <span className="text-[11px] font-semibold text-primary-500">This week</span>
            </div>
            <div className="mt-3 space-y-3">
              {rows.map((r, i) => (
                <div key={r.name} className="flex items-center gap-3">
                  <InitialsAvatar initials={r.ini} tone={r.tone} className="h-8 w-8 text-[10px]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-xs font-semibold text-navy-900">
                        {r.name}
                        <span className="ml-1.5 font-normal text-ink-400">· {r.task}</span>
                      </p>
                      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold", r.pill)}>
                        {r.status}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line-200">
                      <div
                        className="h-full rounded-full bg-primary-500 transition-all duration-[1400ms] ease-out-expo"
                        style={{ width: inView ? `${r.prog}%` : "6%", transitionDelay: `${i * 180}ms` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Benefits() {
  const { ref, inView } = useInView<HTMLDivElement>(0.25);

  return (
    <section id="benefits" className="border-y border-line-200 bg-white py-24 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2">
        <div ref={ref} className="relative">
          <div
            aria-hidden="true"
            className="absolute -left-8 -top-8 h-64 w-64 animate-blob bg-gradient-to-br from-primary-200 to-primary-100 sm:h-80 sm:w-80"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-6 -right-4 h-40 w-40 animate-breathe rounded-[55%_45%_48%_52%/48%_55%_45%_52%] bg-primary-500/15"
          />
          <Reveal className="relative">
            <BenefitDashboard inView={inView} />
          </Reveal>
        </div>

        <div>
          <Reveal>
            <Eyebrow>Why FlowSaaS</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
              Built to Help You Achieve More
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-500">
              One connected workspace that removes friction between planning,
              doing, and reporting — so momentum never stalls.
            </p>
          </Reveal>
          <div className="mt-10 space-y-7">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={i * 130}>
                <div className="flex gap-4">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-500 text-mist-50 shadow-card">
                    <Check className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-navy-900">{b.title}</h3>
                    <p className="mt-1.5 leading-relaxed text-ink-500">{b.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   6. TESTIMONIALS
   ============================================================ */

function Testimonials() {
  return (
    <section id="testimonials" className="py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Testimonials</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            Teams Do Their Best Work on FlowSaaS
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 130}>
              <figure className="group card-lift flex h-full flex-col rounded-xl border border-line-200 bg-white p-7 shadow-soft hover:border-primary-200">
                <Quote className="h-8 w-8 fill-primary-100 text-primary-400 transition-transform duration-500 group-hover:scale-110" />
                <blockquote className="mt-5 flex-1 leading-relaxed text-ink-500">“{t.quote}”</blockquote>
                <figcaption className="mt-7 flex items-center gap-3.5 border-t border-line-200 pt-6">
                  <InitialsAvatar initials={t.initials} tone={t.tone} className="h-11 w-11 text-sm" />
                  <span>
                    <span className="block font-display text-sm font-bold text-navy-900">{t.name}</span>
                    <span className="block text-sm text-ink-400">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   7. CTA / PRICING TEASER — semua tombol membuka dialog
   ============================================================ */

function PricingCta() {
  const ui = useUI();
  const starterPerks = ["Up to 10 seats", "Core automations", "2 GB cloud storage"];
  const businessPerks = ["Unlimited seats", "Advanced analytics", "Priority support"];

  return (
    <section id="pricing" className="relative overflow-hidden pb-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-100/70 blur-3xl"
      />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-[2.6rem] sm:leading-tight">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-lg text-ink-500">Start free today. Upgrade only when your team is ready.</p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Kartu putih: dua kolom paket */}
          <Reveal delay={120}>
            <div className="grid h-full rounded-2xl border border-line-200 bg-white p-8 shadow-card sm:grid-cols-2 sm:divide-x sm:divide-line-200 sm:p-4">
              <div className="flex flex-col p-4 sm:p-6">
                <h3 className="font-display text-xl font-bold text-navy-900">Starter</h3>
                <p className="mt-1 text-sm text-ink-500">Perfect for small teams</p>
                <p className="mt-5 font-display text-4xl font-extrabold text-navy-900">
                  $15<span className="text-sm font-medium text-ink-400"> /user/mo</span>
                </p>
                <ul className="mt-6 space-y-2.5">
                  {starterPerks.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-sm text-ink-500">
                      <Check className="h-4 w-4 shrink-0 text-primary-500" /> {p}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => ui.open({ kind: "auth", mode: "signup" })}
                  className="btn-sheen btn-lift mt-8 rounded-lg bg-primary-500 px-5 py-3 text-center text-sm font-semibold text-mist-50 shadow-soft hover:bg-primary-600 sm:mt-auto"
                >
                  Start Free Trial
                </button>
              </div>
              <div className="mt-8 flex flex-col border-t border-line-200 p-4 sm:mt-0 sm:border-t-0 sm:p-6">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-display text-xl font-bold text-navy-900">Business</h3>
                  <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-600">
                    Popular
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-500">Advanced tools for growing teams</p>
                <p className="mt-5 font-display text-4xl font-extrabold text-navy-900">
                  $39<span className="text-sm font-medium text-ink-400"> /user/mo</span>
                </p>
                <ul className="mt-6 space-y-2.5">
                  {businessPerks.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-sm text-ink-500">
                      <Check className="h-4 w-4 shrink-0 text-primary-500" /> {p}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => ui.open({ kind: "pricing" })}
                  className="btn-lift mt-8 rounded-lg border border-ink-300/60 px-5 py-3 text-center text-sm font-semibold text-navy-900 hover:border-primary-400 hover:text-primary-600 sm:mt-auto"
                >
                  View Pricing
                </button>
              </div>
            </div>
          </Reveal>

          {/* Kartu indigo: Enterprise */}
          <Reveal delay={240}>
            <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-primary-500 p-8 text-mist-50 shadow-pop transition-transform duration-500 ease-out-expo hover:-translate-y-2">
              <div
                aria-hidden="true"
                className="absolute -right-16 -top-16 h-48 w-48 animate-breathe rounded-full border-[14px] border-primary-400/40"
              />
              <h3 className="relative font-display text-2xl font-extrabold">Enterprise Solution</h3>
              <p className="relative mt-3 max-w-[16rem] leading-relaxed text-primary-100">
                Custom plans for your organization — dedicated infrastructure, SSO, and a success manager.
              </p>
              <button
                onClick={() => ui.open({ kind: "contact" })}
                className="btn-sheen btn-lift relative mt-8 inline-flex w-fit items-center gap-2 rounded-lg bg-mist-50 px-6 py-3 text-sm font-bold text-primary-600 shadow-soft hover:bg-primary-50"
              >
                Contact Sales
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Ilustrasi gedung (garis putih, SVG murni) */}
              <svg
                viewBox="0 0 150 110"
                className="relative mt-auto w-44 self-end text-primary-100/80"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <rect x="14" y="38" width="38" height="62" rx="2" />
                <path d="M22 48h6M32 48h6M42 48h4M22 58h6M32 58h6M42 58h4M22 68h6M32 68h6M42 68h4M22 78h6M32 78h6M42 78h4M28 100v-12h10v12" />
                <rect x="60" y="14" width="40" height="86" rx="2" />
                <path d="M80 14V4M74 4h12" />
                <path d="M68 24h6M80 24h6M92 24h2M68 34h6M80 34h6M92 34h2M68 44h6M80 44h6M92 44h2M68 54h6M80 54h6M92 54h2M68 64h6M80 64h6M92 64h2M68 74h6M80 74h6M92 74h2" />
                <rect x="108" y="52" width="30" height="48" rx="2" />
                <path d="M116 62h6M126 62h6M116 72h6M126 72h6M116 82h6M126 82h6" />
                <path d="M52 52h8M100 40h8" strokeDasharray="3 4" />
                <path d="M4 100h142" />
                <circle cx="80" cy="4" r="3" fill="currentColor" stroke="none" />
              </svg>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   8. FOOTER — semua tautan berfungsi (modal / anchor / eksternal)
   ============================================================ */

const SOCIAL_ICONS: Record<string, ReactNode> = {
  twitter: (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="currentColor" aria-hidden="true">
      <path d="M17.8 3h2.9l-6.4 7.3 7.5 10.7h-5.9l-4.6-6.1-5.3 6.1H3.1l6.8-7.8L2.7 3h6l4.2 5.5L17.8 3zm-1 16.2h1.6L7.9 4.7H6.2l10.6 14.5z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 1 1-.02 5 2.5 2.5 0 0 1 .02-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.5c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21H9z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8V11H8v3h2.5v7h3z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  ),
};

function Footer() {
  const ui = useUI();

  type FLink = { label: string; href?: string; modal?: ModalState };
  const cols: { title: string; links: FLink[] }[] = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Integrations", modal: { kind: "info", page: "integrations" } },
        { label: "Changelog", modal: { kind: "info", page: "changelog" } },
        { label: "Pricing", href: "#pricing" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", modal: { kind: "info", page: "about" } },
        { label: "Careers", modal: { kind: "info", page: "careers" } },
        { label: "Blog", modal: { kind: "info", page: "blog" } },
        { label: "Contact", modal: { kind: "contact" } },
      ],
    },
    {
      title: "Resources",
      links: RESOURCES_LINKS.map((r) => ({ label: r.label, modal: { kind: "info", page: r.page } as ModalState })),
    },
  ];

  const socials = [
    { icon: SOCIAL_ICONS.twitter, label: "Twitter", href: "https://x.com" },
    { icon: SOCIAL_ICONS.linkedin, label: "LinkedIn", href: "https://www.linkedin.com" },
    { icon: SOCIAL_ICONS.facebook, label: "Facebook", href: "https://www.facebook.com" },
    { icon: SOCIAL_ICONS.instagram, label: "Instagram", href: "https://www.instagram.com" },
  ];

  return (
    <footer id="resources" className="bg-navy-900 text-mist-50">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-xs leading-relaxed text-ink-300">
              All-in-one platform to help teams collaborate, automate, and grow.
            </p>
            <p className="mt-6 flex items-center gap-2 text-sm text-ink-400">
              <span className="h-2 w-2 animate-pulse-dot rounded-full bg-emerald-400" />
              All systems operational
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {cols.map((col) => (
              <div key={col.title}>
                <h4 className="font-display text-sm font-bold uppercase tracking-wider text-primary-300">{col.title}</h4>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.href ? (
                        <a href={link.href} className="link-underline text-sm text-ink-300 transition-colors hover:text-mist-50">
                          {link.label}
                        </a>
                      ) : (
                        <button
                          onClick={() => link.modal && ui.open(link.modal)}
                          className="link-underline cursor-pointer text-left text-sm text-ink-300 transition-colors hover:text-mist-50"
                        >
                          {link.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="col-span-2 sm:col-span-1">
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-primary-300">Follow Us</h4>
              <div className="mt-5 flex gap-3">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="lift-sm grid h-10 w-10 place-items-center rounded-lg border border-white/15 text-ink-300 hover:border-primary-400 hover:bg-primary-500 hover:text-mist-50"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-ink-400">© 2024 FlowSaaS. All rights reserved.</p>
          <div className="flex gap-8">
            <button onClick={() => ui.open({ kind: "info", page: "privacy" })} className="link-underline cursor-pointer text-sm text-ink-400 transition-colors hover:text-mist-50">
              Privacy Policy
            </button>
            <button onClick={() => ui.open({ kind: "info", page: "terms" })} className="link-underline cursor-pointer text-sm text-ink-400 transition-colors hover:text-mist-50">
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
   ROOT — provider UI + susunan section + host modal/toast
   ============================================================ */

export default function App() {
  const [modal, setModal] = useState<ModalState | null>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);

  const toast = (msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, msg }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3800);
  };

  const ui: UIApi = {
    open: (m) => setModal(m),
    close: () => setModal(null),
    toast,
  };

  return (
    <UICtx.Provider value={ui}>
      <div className="min-h-screen overflow-x-clip bg-mist-50 font-sans text-navy-900">
        <Navbar />
        <main>
          <Hero />
          <TrustedBy />
          <Features />
          <Benefits />
          <Testimonials />
          <PricingCta />
        </main>
        <Footer />

        {/* Dialog & notifikasi */}
        <ModalHost modal={modal} onClose={() => setModal(null)} />
        <div className="pointer-events-none fixed bottom-6 right-5 z-[120] flex w-[calc(100vw-2.5rem)] max-w-sm flex-col gap-2.5">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="animate-toast-in pointer-events-auto flex items-center gap-3 rounded-xl border border-line-200 bg-white px-4 py-3.5 shadow-lift"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-500">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <p className="text-sm font-medium text-navy-900">{t.msg}</p>
            </div>
          ))}
        </div>
      </div>
    </UICtx.Provider>
  );
}
