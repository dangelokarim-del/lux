"use client";

/**
 * The admin / settings layer — where a client turns LUXA into *their* operations
 * system: portfolio identity, properties, team, departments, the assignment
 * engine's rules, integrations and branding. Everything reads from and writes to
 * the same store the dashboard uses, so edits are live everywhere instantly.
 */
import { useMemo, useState } from "react";
import {
  Building2, Users, Boxes, GitBranch, Plug, Palette, SlidersHorizontal, Globe, Phone,
  Plus, Trash2, Pencil, Check, X, ArrowRightLeft,
} from "lucide-react";
import { Card, Field, Input, Textarea, Avatar, StatusPill, buttonVariants } from "@/components/ui";
import { useLuxa, useProperties, useStaff, useSettings, useWorkspace } from "@/lib/store/hooks";
import { useToast } from "@/components/product/Toast";
import { timeAgo } from "@/components/product/format";
import { cn } from "@/lib/utils";
import { isLive, hasSupabaseAdmin } from "@/lib/config";
import {
  newId, deptLabel,
  PROPERTY_STATUSES, propertyStatusMeta,
  PRESENCES, presenceMeta,
  PRIORITIES, priorityMeta,
  CATEGORIES, categoryMeta,
  KPI_CATALOG,
  type Property, type Staff, type AssignmentRule, type DepartmentDef,
  type Organization, type WhatsAppAccount,
} from "@/lib/domain";

const PLANS = ["Starter", "Growth", "Enterprise"];

const DEFAULT_ROOMS = ["Master Bedroom", "Guest Bedroom", "Bathroom", "Kitchen", "Living Room", "Pool", "Terrace", "Garden"];
const selectClass = "h-10 w-full rounded-[var(--radius-control)] border border-line-2 bg-bg-elev px-3 text-[14px] text-ink outline-none transition-colors focus:border-accent";

type SectionId = "workspaces" | "whatsapp" | "portfolio" | "properties" | "team" | "departments" | "rules" | "integrations" | "branding";
const SECTIONS: { id: SectionId; label: string; icon: typeof Building2 }[] = [
  { id: "workspaces", label: "Workspaces", icon: Globe },
  { id: "whatsapp", label: "WhatsApp Numbers", icon: Phone },
  { id: "portfolio", label: "Portfolio", icon: SlidersHorizontal },
  { id: "properties", label: "Properties", icon: Building2 },
  { id: "team", label: "Team", icon: Users },
  { id: "departments", label: "Departments", icon: Boxes },
  { id: "rules", label: "Assignment Rules", icon: GitBranch },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "branding", label: "Branding", icon: Palette },
];

export function SettingsWorkspace() {
  const [section, setSection] = useState<SectionId>("workspaces");
  return (
    <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[220px_1fr]">
      {/* section rail */}
      <nav className="flex gap-1.5 overflow-x-auto lg:flex-col lg:gap-1">
        {SECTIONS.map((s) => {
          const active = section === s.id;
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-[var(--radius-control)] px-3.5 py-2.5 text-left text-[13.5px] transition-colors",
                active ? "bg-white/[0.06] text-ink" : "text-ink-3 hover:bg-white/[0.03] hover:text-ink"
              )}
            >
              <Icon size={16} className={active ? "text-accent" : ""} />
              {s.label}
            </button>
          );
        })}
      </nav>

      <div className="min-w-0">
        {section === "workspaces" && <WorkspacesPanel />}
        {section === "whatsapp" && <WhatsAppPanel />}
        {section === "portfolio" && <PortfolioPanel />}
        {section === "properties" && <PropertiesPanel />}
        {section === "team" && <TeamPanel />}
        {section === "departments" && <DepartmentsPanel />}
        {section === "rules" && <RulesPanel />}
        {section === "integrations" && <IntegrationsPanel />}
        {section === "branding" && <BrandingPanel />}
      </div>
    </div>
  );
}

/* --------------------------------- shells -------------------------------- */
function PanelHead({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-[17px] font-semibold tracking-[-0.02em]">{title}</h2>
        {subtitle && <p className="mt-1 text-[13px] text-ink-3">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function IconBtn({ onClick, children, label, danger }: { onClick: () => void; children: React.ReactNode; label: string; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-[var(--radius-control)] border border-line bg-white/[0.02] transition-colors",
        danger ? "text-ink-3 hover:border-urgent/40 hover:text-urgent" : "text-ink-3 hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------ Workspaces ------------------------------- */
function WorkspacesPanel() {
  const ws = useWorkspace();
  const store = useLuxa();
  const { show } = useToast();
  const [draft, setDraft] = useState<Organization | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPlan, setNewPlan] = useState("Starter");

  const current = ws.organizations.find((o) => o.id === ws.currentOrgId);

  function saveEdit() {
    if (!draft) return;
    store.updateOrg({ ...draft, name: draft.name.trim() || "Organization" });
    show({ kind: "success", title: "Workspace updated", body: draft.name });
    setDraft(null);
  }
  function create() {
    if (!newName.trim()) return show({ kind: "error", title: "Name is required" });
    store.createOrg({ name: newName.trim(), plan: newPlan });
    show({ kind: "success", title: "Workspace created", body: `${newName} · now active` });
    setNewName(""); setCreating(false);
  }

  return (
    <div className="max-w-2xl">
      <PanelHead
        title="Workspaces"
        subtitle="Each customer is an isolated organization. Switch between them — the whole dashboard changes."
        action={!creating && <button onClick={() => setCreating(true)} className={buttonVariants({ variant: "accent", size: "sm" })}><Plus size={15} /> New workspace</button>}
      />

      {/* current org banner */}
      {current && (
        <div className="mb-5 flex items-center justify-between rounded-[var(--radius-control)] border border-accent/25 bg-accent/[0.06] px-4 py-3.5">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/15 text-accent"><Globe size={17} /></span>
            <div>
              <div className="text-[14px] font-medium text-ink">{current.name}</div>
              <div className="text-[12px] text-ink-3">Active workspace · {current.plan} plan</div>
            </div>
          </div>
          <StatusPill tone="accent">Current</StatusPill>
        </div>
      )}

      {creating && (
        <Card className="mb-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Workspace name"><Input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Monaco Estates" /></Field>
            <Field label="Plan">
              <select className={selectClass} value={newPlan} onChange={(e) => setNewPlan(e.target.value)}>{PLANS.map((p) => <option key={p} value={p}>{p}</option>)}</select>
            </Field>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={create} className={buttonVariants({ variant: "accent", size: "sm" })}><Check size={15} /> Create & switch</button>
            <button onClick={() => setCreating(false)} className={buttonVariants({ variant: "secondary", size: "sm" })}><X size={15} /> Cancel</button>
          </div>
        </Card>
      )}

      <Card className="divide-y divide-line">
        {ws.organizations.map((o) => {
          const active = o.id === ws.currentOrgId;
          const editing = draft?.id === o.id;
          return (
            <div key={o.id} className="px-4 py-3.5">
              {editing ? (
                <div className="grid gap-3 sm:grid-cols-[1fr_160px_auto]">
                  <Input value={draft!.name} onChange={(e) => setDraft({ ...draft!, name: e.target.value })} />
                  <select className={selectClass} value={draft!.plan} onChange={(e) => setDraft({ ...draft!, plan: e.target.value })}>{PLANS.map((p) => <option key={p} value={p}>{p}</option>)}</select>
                  <div className="flex gap-1.5">
                    <IconBtn label="Save" onClick={saveEdit}><Check size={14} /></IconBtn>
                    <IconBtn label="Cancel" onClick={() => setDraft(null)}><X size={14} /></IconBtn>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[14px] font-medium text-ink">{o.name}</span>
                      {active && <StatusPill tone="accent">Active</StatusPill>}
                    </div>
                    <div className="text-[12px] text-ink-3">{o.plan} plan</div>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    {!active && (
                      <button onClick={() => store.switchOrg(o.id)} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                        <ArrowRightLeft size={14} /> Switch
                      </button>
                    )}
                    <IconBtn label="Edit" onClick={() => setDraft(o)}><Pencil size={14} /></IconBtn>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </Card>
    </div>
  );
}

/* ---------------------------- WhatsApp Numbers --------------------------- */
function WhatsAppPanel() {
  const ws = useWorkspace();
  const store = useLuxa();
  const { show } = useToast();
  const orgName = (id: string) => ws.organizations.find((o) => o.id === id)?.name ?? "—";
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ phoneNumberId: "", displayNumber: "", label: "", organizationId: ws.currentOrgId });

  function add() {
    if (!form.phoneNumberId.trim() || !form.displayNumber.trim()) return show({ kind: "error", title: "Number and phone_number_id are required" });
    store.addWhatsAppAccount({ ...form });
    show({ kind: "success", title: "WhatsApp number connected", body: `${form.displayNumber} → ${orgName(form.organizationId)}` });
    setForm({ phoneNumberId: "", displayNumber: "", label: "", organizationId: ws.currentOrgId });
    setAdding(false);
  }

  return (
    <div className="max-w-3xl">
      <PanelHead
        title="WhatsApp Numbers"
        subtitle="Each Business number routes incoming messages to one organization by its phone_number_id."
        action={!adding && <button onClick={() => setAdding(true)} className={buttonVariants({ variant: "accent", size: "sm" })}><Plus size={15} /> Add number</button>}
      />

      {adding && (
        <Card className="mb-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Display number"><Input autoFocus value={form.displayNumber} onChange={(e) => setForm({ ...form, displayNumber: e.target.value })} placeholder="+34 600 000 000" /></Field>
            <Field label="phone_number_id" hint="Meta's routing key"><Input value={form.phoneNumberId} onChange={(e) => setForm({ ...form, phoneNumberId: e.target.value })} placeholder="1049385729…" /></Field>
            <Field label="Label"><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Main line" /></Field>
            <Field label="Connect to workspace">
              <select className={selectClass} value={form.organizationId} onChange={(e) => setForm({ ...form, organizationId: e.target.value })}>
                {ws.organizations.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </Field>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={add} className={buttonVariants({ variant: "accent", size: "sm" })}><Check size={15} /> Connect</button>
            <button onClick={() => setAdding(false)} className={buttonVariants({ variant: "secondary", size: "sm" })}><X size={15} /> Cancel</button>
          </div>
        </Card>
      )}

      <Card className="divide-y divide-line">
        {ws.whatsappAccounts.length === 0 && <div className="px-4 py-8 text-center text-[13px] text-ink-3">No numbers connected yet.</div>}
        {ws.whatsappAccounts.map((w) => (
          <div key={w.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#25D366]/12 text-[#43d178]"><Phone size={16} /></span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[14px] font-medium text-ink">{w.displayNumber}</span>
                  <StatusPill tone={w.active ? "ok" : "muted"}>{w.active ? "Active" : "Inactive"}</StatusPill>
                </div>
                <div className="truncate font-mono text-[11px] text-ink-4">id {w.phoneNumberId} · {orgName(w.organizationId)}</div>
                <div className="text-[11px] text-ink-3">{w.lastMessageAt ? `Last message ${timeAgo(w.lastMessageAt)}` : "No messages yet"}{w.label ? ` · ${w.label}` : ""}</div>
              </div>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <button onClick={() => store.updateWhatsAppAccount({ ...w, active: !w.active })} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                {w.active ? "Deactivate" : "Activate"}
              </button>
              <IconBtn label="Delete" danger onClick={() => store.deleteWhatsAppAccount(w.id)}><Trash2 size={14} /></IconBtn>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ------------------------------- Portfolio ------------------------------- */
function PortfolioPanel() {
  const settings = useSettings();
  const store = useLuxa();
  const { show } = useToast();
  const [form, setForm] = useState({
    portfolioName: settings.portfolioName,
    location: settings.location,
    language: settings.language,
    timezone: settings.timezone,
  });
  const [kpis, setKpis] = useState<string[]>(settings.visibleKpis);

  function toggleKpi(id: string) {
    setKpis((cur) => (cur.includes(id) ? cur.filter((k) => k !== id) : [...KPI_CATALOG.map((k) => k.id).filter((k) => cur.includes(k) || k === id)]));
  }
  function save() {
    store.updateSettings({ ...form, portfolioName: form.portfolioName.trim() || "Portfolio", visibleKpis: kpis });
    show({ kind: "success", title: "Portfolio saved" });
  }

  return (
    <div className="max-w-2xl">
      <PanelHead title="Portfolio" subtitle="Your operation's identity — shown across the dashboard, sidebar and guest replies." />
      <Card className="p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Portfolio name"><Input value={form.portfolioName} onChange={(e) => setForm({ ...form, portfolioName: e.target.value })} placeholder="Marbella Portfolio" /></Field>
          <Field label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Marbella" /></Field>
          <Field label="Language">
            <select className={selectClass} value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
              {[["en", "English"], ["es", "Español"], ["fr", "Français"], ["de", "Deutsch"], ["it", "Italiano"], ["ar", "العربية"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Timezone">
            <select className={selectClass} value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
              {["Europe/Madrid", "Europe/London", "Europe/Paris", "Asia/Dubai", "America/New_York", "UTC"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
        </div>
      </Card>

      <div className="mt-6">
        <h3 className="mb-3 text-[14px] font-medium">Visible dashboard KPIs</h3>
        <Card className="divide-y divide-line">
          {KPI_CATALOG.map((k) => (
            <label key={k.id} className="flex cursor-pointer items-center justify-between px-4 py-3 text-[14px]">
              <span className="text-ink">{k.label}</span>
              <input type="checkbox" checked={kpis.includes(k.id)} onChange={() => toggleKpi(k.id)} className="h-4 w-4 accent-accent" />
            </label>
          ))}
        </Card>
      </div>

      <div className="mt-6">
        <button onClick={save} className={buttonVariants({ variant: "accent" })}>Save changes</button>
      </div>
    </div>
  );
}

/* ------------------------------- Properties ------------------------------ */
function PropertiesPanel() {
  const properties = useProperties();
  const store = useLuxa();
  const { show } = useToast();
  const [draft, setDraft] = useState<Property | null>(null);

  const blank = (): Property => ({ id: newId("prop"), name: "", type: "Villa", area: "", bedrooms: 4, status: "vacant", currentGuestId: null, rooms: DEFAULT_ROOMS, notes: "" });

  function save() {
    if (!draft) return;
    if (!draft.name.trim()) return show({ kind: "error", title: "Property name is required" });
    store.upsertProperty({ ...draft, name: draft.name.trim(), area: draft.area.trim() });
    show({ kind: "success", title: "Property saved", body: draft.name.trim() });
    setDraft(null);
  }
  function remove(p: Property) {
    store.deleteProperty(p.id);
    show({ kind: "info", title: "Property removed", body: p.name });
  }

  return (
    <div className="max-w-3xl">
      <PanelHead
        title="Properties"
        subtitle={`${properties.length} in the portfolio · villas, apartments, hotels, suites, yachts — any type.`}
        action={!draft && <button onClick={() => setDraft(blank())} className={buttonVariants({ variant: "accent", size: "sm" })}><Plus size={15} /> Add property</button>}
      />

      {draft && (
        <Card className="mb-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><Input autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Villa Ocean" /></Field>
            <Field label="Type"><Input value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} placeholder="Villa / Apartment / Hotel / Suite / Yacht" /></Field>
            <Field label="Location"><Input value={draft.area} onChange={(e) => setDraft({ ...draft, area: e.target.value })} placeholder="Golden Mile" /></Field>
            <Field label="Bedrooms"><Input type="number" min={0} value={draft.bedrooms} onChange={(e) => setDraft({ ...draft, bedrooms: Number(e.target.value) || 0 })} /></Field>
            <Field label="Status">
              <select className={selectClass} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Property["status"] })}>
                {PROPERTY_STATUSES.map((s) => <option key={s} value={s}>{propertyStatusMeta[s].label}</option>)}
              </select>
            </Field>
            <Field label="Notes" className="sm:col-span-2"><Textarea value={draft.notes ?? ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} placeholder="Access codes, guest preferences, standing instructions…" /></Field>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={save} className={buttonVariants({ variant: "accent", size: "sm" })}><Check size={15} /> Save</button>
            <button onClick={() => setDraft(null)} className={buttonVariants({ variant: "secondary", size: "sm" })}><X size={15} /> Cancel</button>
          </div>
        </Card>
      )}

      <Card className="divide-y divide-line">
        {properties.length === 0 && <div className="px-4 py-8 text-center text-[13px] text-ink-3">No properties yet — add your first.</div>}
        {properties.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-[14px] font-medium text-ink">{p.name}</span>
                <StatusPill tone={propertyStatusMeta[p.status].tone}>{propertyStatusMeta[p.status].label}</StatusPill>
              </div>
              <div className="truncate text-[12px] text-ink-3">{p.type} · {p.area || "—"} · {p.bedrooms} bd</div>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <IconBtn label="Edit" onClick={() => setDraft(p)}><Pencil size={14} /></IconBtn>
              <IconBtn label="Delete" danger onClick={() => remove(p)}><Trash2 size={14} /></IconBtn>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ---------------------------------- Team --------------------------------- */
function TeamPanel() {
  const team = useStaff();
  const settings = useSettings();
  const store = useLuxa();
  const { show } = useToast();
  const [draft, setDraft] = useState<Staff | null>(null);

  const depts = settings.departments;
  const blank = (): Staff => ({ id: newId("staff"), name: "", role: "", department: depts[0]?.id ?? "concierge", presence: "available", initials: "", maxActiveTasks: 5, languages: [] });
  const initialsOf = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";

  function save() {
    if (!draft) return;
    if (!draft.name.trim()) return show({ kind: "error", title: "Name is required" });
    store.upsertStaff({ ...draft, name: draft.name.trim(), initials: (draft.initials.trim() || initialsOf(draft.name)).slice(0, 2) });
    show({ kind: "success", title: "Team member saved", body: draft.name.trim() });
    setDraft(null);
  }
  function remove(s: Staff) {
    store.deleteStaff(s.id);
    show({ kind: "info", title: "Removed", body: s.name });
  }

  return (
    <div className="max-w-3xl">
      <PanelHead
        title="Team"
        subtitle={`${team.length} members · the assignment engine routes tasks to them.`}
        action={!draft && <button onClick={() => setDraft(blank())} className={buttonVariants({ variant: "accent", size: "sm" })}><Plus size={15} /> Add member</button>}
      />

      {draft && (
        <Card className="mb-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><Input autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Carlos Núñez" /></Field>
            <Field label="Role"><Input value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} placeholder="Maintenance Lead" /></Field>
            <Field label="Department">
              <select className={selectClass} value={draft.department} onChange={(e) => setDraft({ ...draft, department: e.target.value })}>
                {depts.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={selectClass} value={draft.presence} onChange={(e) => setDraft({ ...draft, presence: e.target.value as Staff["presence"] })}>
                {PRESENCES.map((p) => <option key={p} value={p}>{presenceMeta[p].label}</option>)}
              </select>
            </Field>
            <Field label="Phone"><Input value={draft.phone ?? ""} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="+34 600 000 000" /></Field>
            <Field label="Email"><Input value={draft.email ?? ""} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="name@portfolio.com" /></Field>
            <Field label="Max active tasks"><Input type="number" min={1} value={draft.maxActiveTasks ?? 5} onChange={(e) => setDraft({ ...draft, maxActiveTasks: Number(e.target.value) || 1 })} /></Field>
            <Field label="Languages" hint="comma separated"><Input value={(draft.languages ?? []).join(", ")} onChange={(e) => setDraft({ ...draft, languages: e.target.value.split(",").map((l) => l.trim()).filter(Boolean) })} placeholder="es, en, fr" /></Field>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={save} className={buttonVariants({ variant: "accent", size: "sm" })}><Check size={15} /> Save</button>
            <button onClick={() => setDraft(null)} className={buttonVariants({ variant: "secondary", size: "sm" })}><X size={15} /> Cancel</button>
          </div>
        </Card>
      )}

      <Card className="divide-y divide-line">
        {team.length === 0 && <div className="px-4 py-8 text-center text-[13px] text-ink-3">No team members yet.</div>}
        {team.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={s.name || "?"} size={36} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[14px] font-medium text-ink">{s.name}</span>
                  <StatusPill tone={presenceMeta[s.presence].tone}>{presenceMeta[s.presence].label}</StatusPill>
                </div>
                <div className="truncate text-[12px] text-ink-3">{s.role || "—"} · {deptLabel(s.department)}</div>
              </div>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <IconBtn label="Edit" onClick={() => setDraft(s)}><Pencil size={14} /></IconBtn>
              <IconBtn label="Delete" danger onClick={() => remove(s)}><Trash2 size={14} /></IconBtn>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ------------------------------ Departments ------------------------------ */
function DepartmentsPanel() {
  const settings = useSettings();
  const store = useLuxa();
  const { show } = useToast();
  const [label, setLabel] = useState("");

  function add() {
    const name = label.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    if (settings.departments.some((d) => d.id === id)) return show({ kind: "error", title: "Department already exists" });
    const next: DepartmentDef[] = [...settings.departments, { id, label: name, custom: true }];
    store.updateSettings({ departments: next });
    setLabel("");
    show({ kind: "success", title: "Department added", body: name });
  }
  function remove(d: DepartmentDef) {
    store.updateSettings({ departments: settings.departments.filter((x) => x.id !== d.id) });
    show({ kind: "info", title: "Department removed", body: d.label });
  }

  return (
    <div className="max-w-2xl">
      <PanelHead title="Departments" subtitle="The teams your operation runs. Add custom ones — the assignment engine and team use them." />
      <div className="mb-5 flex gap-2">
        <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Pool Service" onKeyDown={(e) => e.key === "Enter" && add()} />
        <button onClick={add} className={buttonVariants({ variant: "accent" })}><Plus size={15} /> Add</button>
      </div>
      <Card className="divide-y divide-line">
        {settings.departments.map((d) => (
          <div key={d.id} className="flex items-center justify-between px-4 py-3">
            <span className="text-[14px] text-ink">{d.label}{!d.custom && <span className="ml-2 text-[11px] text-ink-4">built-in</span>}</span>
            {d.custom && <IconBtn label="Delete" danger onClick={() => remove(d)}><Trash2 size={14} /></IconBtn>}
          </div>
        ))}
      </Card>
    </div>
  );
}

/* --------------------------- Assignment Rules ---------------------------- */
function RulesPanel() {
  const settings = useSettings();
  const store = useLuxa();
  const { show } = useToast();

  const depts = settings.departments;
  function update(rules: AssignmentRule[]) { store.updateSettings({ rules }); }
  function patch(id: string, p: Partial<AssignmentRule>) { update(settings.rules.map((r) => (r.id === id ? { ...r, ...p } : r))); }
  function remove(id: string) { update(settings.rules.filter((r) => r.id !== id)); }
  function add() {
    update([...settings.rules, { id: newId("rule"), label: "New rule", keywords: [], category: "other", department: depts[0]?.id ?? "front_desk", enabled: true }]);
    show({ kind: "success", title: "Rule added" });
  }

  return (
    <div className="max-w-3xl">
      <PanelHead
        title="Assignment Rules"
        subtitle="If a message contains any keyword → set the category & department. Evaluated top to bottom."
        action={<button onClick={add} className={buttonVariants({ variant: "accent", size: "sm" })}><Plus size={15} /> Add rule</button>}
      />
      <div className="space-y-3">
        {settings.rules.map((r) => (
          <Card key={r.id} className={cn("p-4", !r.enabled && "opacity-60")}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <Input value={r.label} onChange={(e) => patch(r.id, { label: e.target.value })} className="max-w-xs font-medium" />
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => patch(r.id, { enabled: !r.enabled })}
                  className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors", r.enabled ? "bg-ok/15 text-ok" : "bg-white/[0.05] text-ink-3")}
                >
                  {r.enabled ? "Enabled" : "Disabled"}
                </button>
                <IconBtn label="Delete rule" danger onClick={() => remove(r.id)}><Trash2 size={14} /></IconBtn>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Keywords" hint="comma separated" className="sm:col-span-2">
                <Input value={r.keywords.join(", ")} onChange={(e) => patch(r.id, { keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) })} placeholder="ac, air conditioning, not working" />
              </Field>
              <Field label="Category">
                <select className={selectClass} value={r.category} onChange={(e) => patch(r.id, { category: e.target.value as AssignmentRule["category"] })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{categoryMeta[c].label}</option>)}
                </select>
              </Field>
              <Field label="Department">
                <select className={selectClass} value={r.department} onChange={(e) => patch(r.id, { department: e.target.value })}>
                  {depts.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                </select>
              </Field>
              <Field label="Priority override">
                <select className={selectClass} value={r.priority ?? ""} onChange={(e) => patch(r.id, { priority: (e.target.value || undefined) as AssignmentRule["priority"] })}>
                  <option value="">— keep AI priority —</option>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{priorityMeta[p].label}</option>)}
                </select>
              </Field>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-5">
        <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px] text-ink-2">
          <input type="checkbox" checked={settings.autoAssign} onChange={(e) => store.updateSettings({ autoAssign: e.target.checked })} className="h-4 w-4 accent-accent" />
          Auto-assign new tasks to the best available team member
        </label>
      </div>
    </div>
  );
}

/* ------------------------------ Integrations ----------------------------- */
function IntegrationsPanel() {
  const rows = useMemo(() => ([
    { name: "WhatsApp Business", desc: "Guest messages in, replies out", connected: false, note: "Configured via environment" },
    { name: "OpenAI", desc: "Message understanding & extraction", connected: false, note: "Configured via environment" },
    { name: "Supabase", desc: "Realtime database & auth", connected: isLive() || hasSupabaseAdmin(), note: isLive() ? "Connected" : "Demo mode (in-memory)" },
  ]), []);
  return (
    <div className="max-w-2xl">
      <PanelHead title="Integrations" subtitle="Connect the tools your operation runs on. Keys are set securely via environment." />
      <Card className="divide-y divide-line">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center justify-between px-4 py-4">
            <div>
              <div className="text-[14px] font-medium text-ink">{r.name}</div>
              <div className="text-[12px] text-ink-3">{r.desc}</div>
            </div>
            <StatusPill tone={r.connected ? "ok" : "muted"}>{r.note}</StatusPill>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* -------------------------------- Branding ------------------------------- */
function BrandingPanel() {
  const settings = useSettings();
  const store = useLuxa();
  const { show } = useToast();
  const [mark, setMark] = useState(settings.brandMark);
  return (
    <div className="max-w-2xl">
      <PanelHead title="Branding" subtitle="The wordmark shown across your workspace." />
      <Card className="p-5">
        <Field label="Wordmark">
          <Input value={mark} onChange={(e) => setMark(e.target.value)} placeholder="LUXA" className="max-w-xs" />
        </Field>
        <div className="mt-5 rounded-[var(--radius-control)] border border-line bg-black/30 p-6 text-center">
          <span className="text-[22px] font-semibold tracking-[0.2em] text-ink">{(mark || "LUXA").toUpperCase()}</span>
          <span className="ml-1 inline-block h-1 w-1 translate-y-2 rounded-full bg-accent" />
        </div>
        <div className="mt-5">
          <button onClick={() => { store.updateSettings({ brandMark: mark.trim() || "LUXA" }); show({ kind: "success", title: "Branding saved" }); }} className={buttonVariants({ variant: "accent" })}>Save</button>
        </div>
      </Card>
    </div>
  );
}
