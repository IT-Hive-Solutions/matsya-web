import { VerificationStatus } from "@/core/enums/verification-status.enum";
import { IAnimal } from "@/core/interfaces/animal.interface";
import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";

export interface AnalyticsDashboardProps {
  animals: IAnimal[];
  /** Province label shown in the subtitle */
  province?: string;
  /** Today's date label — defaults to current date */
  dateLabel?: string;
}

// ─── Design tokens (raw values needed for recharts / dynamic styles) ──────────

const C = {
  sage: "#4A7C59",
  sageMid: "#6B9180",
  amber: "#C4822A",
  rose: "#B85450",
  blue: "#3D6494",
  brown: "#8B7355",
  border: "#E8E4DC",
  t1: "#1C2025",
  t2: "#6B6760",
  t3: "#A8A49E",
  track: "#F0EDE7",
};

// ─── Data derivation ──────────────────────────────────────────────────────────

function useAnalytics(animals: IAnimal[]) {
  return useMemo(() => {
    const total = animals.length;
    const owners = new Set(animals.map((a) => a.owners_id.id));

    // Verification
    const approved = animals.filter(
      (a) => a.verification_status === VerificationStatus.Validated,
    ).length;
    const pending = animals.filter(
      (a) => a.verification_status === VerificationStatus.Pending,
    ).length;
    const rejected = animals.filter(
      (a) => a.verification_status === VerificationStatus.Rejected,
    ).length;

    // Vaccination
    const vaccinated = animals.filter((a) => a.is_vaccination_applied).length;
    const unvaccinated = total - vaccinated;
    const vaccinationPct =
      total > 0 ? Math.round((vaccinated / total) * 100) : 0;
    const approvalPct = total > 0 ? Math.round((approved / total) * 100) : 0;

    // Verification chart data
    const verificationData = [
      { name: "Approved", value: approved, color: C.sage },
      { name: "Pending", value: pending, color: C.amber },
      { name: "Rejected", value: rejected, color: C.rose },
    ];

    // Breed categories
    const categoryMap: Record<string, number> = {};
    animals.forEach((a) => {
      const key = a.animal_category?.category_name ?? "Unknown";
      categoryMap[key] = (categoryMap[key] ?? 0) + 1;
    });
    const categoryColors = [C.sage, C.blue, C.amber, C.brown];
    const categoryData = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({
        name,
        value,
        pct: total > 0 ? Math.round((value / total) * 100) : 0,
        color: categoryColors[i % categoryColors.length],
      }));

    // Production purpose
    const purposeMap: Record<string, number> = {};
    animals.forEach((a) => {
      const key = a.production_capacity?.capacity_name ?? "Unknown";
      purposeMap[key] = (purposeMap[key] ?? 0) + 1;
    });
    const purposeData = Object.entries(purposeMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

    // Species
    const speciesMap: Record<string, number> = {};
    animals.forEach((a) => {
      const key = a.animal_type?.animal_name ?? "Unknown";
      speciesMap[key] = (speciesMap[key] ?? 0) + 1;
    });
    const speciesColors = [C.sage, C.blue, C.amber, C.brown, C.rose];
    const speciesData = Object.entries(speciesMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({
        name,
        value,
        color: speciesColors[i % speciesColors.length],
      }));

    // Owner breakdown
    const ownerMap: Record<
      number,
      { name: string; approved: number; pending: number; rejected: number }
    > = {};
    animals.forEach((a) => {
      const oid = a.owners_id.id;
      if (!ownerMap[oid]) {
        const parts = a.owners_id.owners_name.trim().split(/\s+/);
        const short =
          parts.length > 1
            ? `${parts[0][0]}. ${parts.slice(1).join(" ")}`
            : parts[0];
        ownerMap[oid] = { name: short, approved: 0, pending: 0, rejected: 0 };
      }
      if (a.verification_status === VerificationStatus.Validated)
        ownerMap[oid].approved++;
      else if (a.verification_status === "draft") ownerMap[oid].pending++;
      else ownerMap[oid].rejected++;
    });
    const ownerData = Object.values(ownerMap);

    // Districts
    const districtMap: Record<number, { label: string; count: number }> = {};
    animals.forEach((a) => {
      const did = a.owners_id.district_id.id;
      if (!districtMap[did]) {
        districtMap[did] = {
          label: `District ${did} · ${a.owners_id.local_level_name}`,
          count: 0,
        };
      }
      districtMap[did].count++;
    });
    const districtData = Object.entries(districtMap)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([, v]) => v);

    const wardNumbers = [
      ...new Set(animals.map((a) => a.owners_id.ward_number)),
    ]
      .sort()
      .join(" · ");

    // Age buckets
    const ageBucketDefs = [
      { range: "0–2y", min: 0, max: 2 },
      { range: "3–4y", min: 3, max: 4 },
      { range: "5–6y", min: 5, max: 6 },
      { range: "7–9y", min: 7, max: 9 },
      { range: "10y+", min: 10, max: Infinity },
    ];
    const ageBuckets = ageBucketDefs.map(({ range, min, max }) => ({
      range,
      count: animals.filter((a) => a.age_years >= min && a.age_years <= max)
        .length,
    }));

    const ages = animals.map((a) => a.age_years + parseInt(a.age_months) / 12);
    const avgAge =
      ages.length > 0
        ? (ages.reduce((s, v) => s + v, 0) / ages.length).toFixed(1)
        : "—";
    const minAge = ages.length > 0 ? Math.min(...ages).toFixed(1) : "—";
    const maxAge = ages.length > 0 ? Math.max(...ages).toFixed(1) : "—";

    // Timeline — cumulative by month
    const monthCounts: Record<string, number> = {};
    animals.forEach((a) => {
      const d = new Date(a.date_created);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthCounts[key] = (monthCounts[key] ?? 0) + 1;
    });
    const sortedMonths = Object.keys(monthCounts).sort();
    let cum = 0;
    const MONTH_NAMES = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const timelineData = sortedMonths.map((key) => {
      cum += monthCounts[key];
      const [, m] = key.split("-");
      return { month: MONTH_NAMES[parseInt(m) - 1], cumulative: cum, key };
    });

    return {
      total,
      owners: owners.size,
      approved,
      pending,
      rejected,
      vaccinated,
      unvaccinated,
      vaccinationPct,
      approvalPct,
      verificationData,
      categoryData,
      purposeData,
      speciesData,
      ownerData,
      districtData,
      wardNumbers,
      ageBuckets,
      minAge,
      avgAge,
      maxAge,
      timelineData,
    };
  }, [animals]);
}

// ─── Tailwind-based sub-components ───────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 my-8 md:my-10">
      <span className="text-[10px] font-bold tracking-[.12em] uppercase text-[#A8A49E] whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-[#E8E4DC]" />
    </div>
  );
}

function KpiCard({
  label,
  value,
  meta,
  valueClass = "text-[#1C2025]",
  delay,
}: {
  label: string;
  value: string | number;
  meta: string;
  valueClass?: string;
  delay: string;
}) {
  return (
    <div
      className="bg-white flex flex-col gap-2 p-6 md:p-7 animate-fadeUp"
      style={{ animationDelay: delay, animationFillMode: "both" }}
    >
      <span className="text-[10px] font-bold tracking-widest uppercase text-[#A8A49E]">
        {label}
      </span>
      <span
        className={` text-5xl md:text-[52px] font-bold leading-none tracking-tight ${valueClass}`}
      >
        {value}
      </span>
      <span className="text-[11.5px] text-[#A8A49E] mt-1">{meta}</span>
    </div>
  );
}

function CardShell({
  title,
  desc,
  badge,
  children,
  delay = ".35s",
  className = "",
}: {
  title: string;
  desc: string;
  badge?: { label: string; variant: "sage" | "amber" };
  children: React.ReactNode;
  delay?: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 md:p-7 border border-[#E8E4DC] animate-fadeUp ${className}`}
      style={{ animationDelay: delay, animationFillMode: "both" }}
    >
      <div className="flex items-start justify-between mb-5 md:mb-6">
        <div>
          <div className="text-[17px] font-medium text-[#1C2025] tracking-tight leading-snug">
            {title}
          </div>
          <div className="text-[11.5px] text-[#A8A49E] mt-1">{desc}</div>
        </div>
        {badge && (
          <span
            className={`text-[10px] font-semibold tracking-[.08em] uppercase px-2.5 py-1 rounded ml-3 shrink-0 ${
              badge.variant === "sage"
                ? "bg-[#D4E6DB] text-[#4A7C59]"
                : "bg-[#F5E4CC] text-[#C4822A]"
            }`}
          >
            {badge.label}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function DonutCenter({ total }: { total: number }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span className="text-[28px] font-bold leading-none text-[#1C2025]">
        {total}
      </span>
      <span className="text-[9px] font-bold tracking-[.08em] uppercase text-[#A8A49E] mt-1">
        Total
      </span>
    </div>
  );
}

function HBar({
  label,
  value,
  pct,
  color,
}: {
  label: string;
  value: number;
  pct: number;
  color: string;
}) {
  return (
    <div className="mb-3.5">
      <div className="flex justify-between mb-1.5">
        <span className="text-[12.5px] font-medium text-[#6B6760]">
          {label}
        </span>
        <span className=" text-[11.5px] text-[#A8A49E]">
          {value} · {pct}%
        </span>
      </div>
      <div className="h-1.75 bg-[#F0EDE7] rounded overflow-hidden">
        <div
          className="h-full rounded transition-all duration-1000"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function TreemapCell({
  label,
  count,
  gradFrom,
  gradTo,
  span,
}: {
  label: string;
  count: number;
  gradFrom: string;
  gradTo: string;
  span?: boolean;
}) {
  return (
    <div
      className="rounded-lg p-3.5 flex flex-col justify-end relative overflow-hidden cursor-default transition-opacity hover:opacity-[.88]"
      style={{
        background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
        gridRow: span ? "1 / 3" : undefined,
      }}
    >
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,.2), transparent)",
        }}
      />
      <div className="relative z-10">
        <div className="text-[28px] font-bold text-white leading-none">
          {count}
        </div>
        <div className="text-[11px] font-semibold text-white/80 mt-0.5 tracking-[.01em]">
          {label}
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E8E4DC] rounded-lg px-3 py-2 shadow-md">
      <div className=" text-[10px] text-[#A8A49E] mb-1">{label}</div>
      {payload.map((p: any) => (
        <div
          key={p.dataKey}
          className="text-[12px] font-semibold text-[#1C2025]"
        >
          {p.dataKey === "cumulative"
            ? `${p.value} registered`
            : `${p.name}: ${p.value}`}
        </div>
      ))}
    </div>
  );
};

// ─── District color palette ───────────────────────────────────────────────────

const DISTRICT_COLORS: [string, string][] = [
  ["#3A6148", "#4A7C59"],
  ["#2E4E73", "#3D6494"],
  ["#9A6820", "#C4822A"],
  ["#7A3E3B", "#B85450"],
  ["#5A4A30", "#8B7355"],
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnalyticsDashboard({
  animals,
  province = "Bagmati Province",
  dateLabel,
}: AnalyticsDashboardProps) {
  const stats = useAnalytics(animals);

  const today =
    dateLabel ??
    new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp { animation: fadeUp .5s ease both; }
      `}</style>

      <div className="w-full min-h-screen bg-[#F6F3ED] ">
        {/* ── Topbar ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 px-5 md:px-12 pt-8 md:pt-12 pb-5 md:pb-6 border-b border-[#E8E4DC]">
          <div>
            <h1 className=" text-3xl md:text-[34px] font-medium text-[#1C2025] tracking-tight leading-tight">
              Registry Analytics
            </h1>
            <p className="text-[13px] text-[#A8A49E] mt-1.5 tracking-[.01em]">
              District-level livestock overview — {province}
            </p>
          </div>
          <div className=" text-[11px] text-[#A8A49E] bg-[#E8E4DC] px-3.5 py-1.5 rounded self-start sm:self-auto">
            {today}
          </div>
        </div>

        <div className="px-5 md:px-12 py-8 md:py-10">
          {/* ── KPI Row ─────────────────────────────────────────── */}
          <div
            className="grid grid-cols-2 lg:grid-cols-4 rounded-2xl overflow-hidden mb-8 md:mb-10"
            style={{
              gap: 2,
              background: C.border,
              border: `1px solid ${C.border}`,
            }}
          >
            <KpiCard
              label="Registered Animals"
              value={stats.total}
              meta={`Across ${stats.owners} owner${stats.owners !== 1 ? "s" : ""}`}
              delay=".05s"
            />
            <KpiCard
              label="Registered Owners"
              value={stats.owners}
              meta={`Avg. ${stats.total > 0 ? (stats.total / stats.owners).toFixed(1) : 0} animals / owner`}
              valueClass="text-[#4A7C59]"
              delay=".12s"
            />
            <KpiCard
              label="Vaccination Rate"
              value={`${stats.vaccinationPct}%`}
              meta={`${stats.vaccinated} of ${stats.total} animals vaccinated`}
              valueClass="text-[#C4822A]"
              delay=".19s"
            />
            <KpiCard
              label="Approval Rate"
              value={`${stats.approvalPct}%`}
              meta={`${stats.approved} approved · ${stats.pending} pending · ${stats.rejected} rejected`}
              valueClass="text-[#B85450]"
              delay=".26s"
            />
          </div>

          {/* ── Row 1: Verification + Vaccination + Category ──── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 mb-4 md:mb-5">
            {/* Donut — Verification */}
            <CardShell
              title="Verification"
              desc="Current approval pipeline"
              delay=".30s"
            >
              <div className="flex items-center gap-5 md:gap-6">
                <div className="relative shrink-0">
                  <PieChart width={130} height={130}>
                    <Pie
                      data={stats.verificationData}
                      cx={60}
                      cy={60}
                      innerRadius={40}
                      outerRadius={58}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                      strokeWidth={0}
                      paddingAngle={2}
                    >
                      {stats.verificationData.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                  </PieChart>
                  <DonutCenter total={stats.total} />
                </div>
                <div className="flex flex-col gap-3 flex-1">
                  {stats.verificationData.map((d) => (
                    <div
                      key={d.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-[2px] shrink-0"
                          style={{ background: d.color }}
                        />
                        <span className="text-[12px] font-medium text-[#6B6760]">
                          {d.name}
                        </span>
                      </div>
                      <span className=" text-[12px] font-medium text-[#1C2025]">
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardShell>

            {/* Vaccination Gauge */}
            <CardShell
              title="Vaccination"
              desc="Coverage across all animals"
              delay=".38s"
            >
              <div className="flex flex-col items-center">
                <svg width="180" height="105" viewBox="0 0 180 105">
                  <path
                    d="M 20 95 A 70 70 0 0 1 160 95"
                    fill="none"
                    stroke={C.track}
                    strokeWidth={16}
                    strokeLinecap="round"
                  />
                  <path
                    d="M 20 95 A 70 70 0 0 1 160 95"
                    fill="none"
                    stroke={C.sage}
                    strokeWidth={16}
                    strokeLinecap="round"
                    strokeDasharray="220"
                    strokeDashoffset={220 - (220 * stats.vaccinationPct) / 100}
                  />
                  <line
                    x1="90"
                    y1="27"
                    x2="90"
                    y2="35"
                    stroke="#E0DDD7"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="20"
                    y1="95"
                    x2="28"
                    y2="95"
                    stroke="#E0DDD7"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="160"
                    y1="95"
                    x2="152"
                    y2="95"
                    stroke="#E0DDD7"
                    strokeWidth="1.5"
                  />
                  <text
                    x="14"
                    y="110"
                    fontSize="9"
                    fill={C.t3}
                    textAnchor="middle"
                  >
                    0%
                  </text>
                  <text
                    x="166"
                    y="110"
                    fontSize="9"
                    fill={C.t3}
                    textAnchor="middle"
                  >
                    100%
                  </text>
                </svg>
                <div className="text-center mt-2.5">
                  <div className=" text-[42px] font-bold text-[#1C2025] leading-none tracking-tight">
                    {stats.vaccinationPct}
                    <span className="text-[22px] opacity-50">%</span>
                  </div>
                  <div className="text-[10.5px] text-[#A8A49E] mt-1.5 tracking-[.08em] uppercase font-medium">
                    Coverage
                  </div>
                </div>
                <div className="mt-4 w-full h-1.5 bg-[#F0EDE7] rounded overflow-hidden">
                  <div
                    className="h-full rounded bg-[#4A7C59]"
                    style={{ width: `${stats.vaccinationPct}%` }}
                  />
                </div>
                <div className="flex justify-between w-full mt-1.5">
                  <span className=" text-[10px] font-semibold text-[#4A7C59]">
                    {stats.vaccinated} vaccinated
                  </span>
                  <span className=" text-[10px] text-[#B85450]">
                    {stats.unvaccinated} not
                  </span>
                </div>
              </div>
            </CardShell>

            {/* Breed Category Bars */}
            <CardShell
              title="Breed Category"
              desc="Distribution by type"
              delay=".46s"
              className="md:col-span-2 xl:col-span-1"
            >
              {stats.categoryData.map((d) => (
                <HBar
                  key={d.name}
                  label={d.name}
                  value={d.value}
                  pct={d.pct}
                  color={d.color}
                />
              ))}
              <div className="mt-5 pt-4 border-t border-[#E8E4DC]">
                <div className="text-[10.5px] font-semibold tracking-[.08em] uppercase text-[#A8A49E] mb-3">
                  Production Purpose
                </div>
                {stats.purposeData.map((d) => (
                  <div
                    key={d.name}
                    className="flex items-center justify-between mb-2"
                  >
                    <span className="text-[12px] text-[#6B6760]">{d.name}</span>
                    <div className="flex items-center gap-2.5">
                      <div className="w-14 h-1 bg-[#F0EDE7] rounded overflow-hidden">
                        <div
                          className="h-full bg-[#8BA89C]"
                          style={{
                            width: `${stats.total > 0 ? (d.value / stats.total) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className=" text-[11px] text-[#A8A49E] w-3">
                        {d.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardShell>
          </div>

          <SectionDivider label="Owner Analysis" />

          {/* ── Row 2: Owner stacked + Species ──────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-4 md:mb-5">
            {/* Stacked horizontal bar — per owner */}
            <CardShell
              title="Animals per Owner"
              desc="Verification status breakdown"
              badge={{
                label: `${stats.owners} owner${stats.owners !== 1 ? "s" : ""}`,
                variant: "sage",
              }}
              delay=".52s"
            >
              <ResponsiveContainer
                width="100%"
                height={Math.max(120, stats.ownerData.length * 52)}
              >
                <BarChart
                  data={stats.ownerData}
                  layout="vertical"
                  margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                  barCategoryGap="35%"
                >
                  <CartesianGrid
                    horizontal={false}
                    stroke={C.track}
                    strokeDasharray="4 4"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    tick={{ fontSize: 12, fill: C.t2 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(0,0,0,.03)" }}
                  />
                  <Bar
                    dataKey="approved"
                    stackId="a"
                    fill={C.sage}
                    radius={[0, 0, 0, 0]}
                    name="Approved"
                  />
                  <Bar
                    dataKey="pending"
                    stackId="a"
                    fill={C.amber}
                    radius={[0, 0, 0, 0]}
                    name="Pending"
                    fillOpacity={0.8}
                  />
                  <Bar
                    dataKey="rejected"
                    stackId="a"
                    fill={C.rose}
                    radius={[4, 4, 4, 4]}
                    name="Rejected"
                    fillOpacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-3.5 pt-3.5 border-t border-[#E8E4DC] flex-wrap">
                {[
                  ["Approved", C.sage],
                  ["Pending", C.amber],
                  ["Rejected", C.rose],
                ].map(([l, c]) => (
                  <div key={l} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-[2px]"
                      style={{ background: c }}
                    />
                    <span className="text-[11px] text-[#A8A49E]">{l}</span>
                  </div>
                ))}
              </div>
            </CardShell>

            {/* Species column chart */}
            <CardShell
              title="Species Distribution"
              desc="By animal type registered"
              delay=".58s"
            >
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={stats.speciesData}
                  margin={{ top: 20, right: 0, bottom: 0, left: -20 }}
                  barCategoryGap="30%"
                >
                  <CartesianGrid
                    vertical={false}
                    stroke={C.track}
                    strokeDasharray="4 4"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: C.t3 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: C.t3 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(0,0,0,.03)" }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Animals">
                    {stats.speciesData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardShell>
          </div>

          <SectionDivider label="Geographic & Age Profile" />

          {/* ── Row 3: District treemap + Age + Vaccination ratio ─ */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 mb-4 md:mb-5">
            {/* District treemap */}
            <CardShell
              title="By District"
              desc="Proportional registration"
              delay=".64s"
            >
              <div
                className="rounded overflow-hidden"
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr",
                  gridTemplateRows: "1fr 1fr",
                  gap: 5,
                  height: 180,
                }}
              >
                {stats.districtData.slice(0, 3).map((d, i) => (
                  <TreemapCell
                    key={d.label}
                    label={d.label}
                    count={d.count}
                    gradFrom={DISTRICT_COLORS[i % DISTRICT_COLORS.length][0]}
                    gradTo={DISTRICT_COLORS[i % DISTRICT_COLORS.length][1]}
                    span={i === 0}
                  />
                ))}
              </div>
              {stats.wardNumbers && (
                <div className="mt-3.5 flex gap-1.5">
                  <span className="text-[10.5px] text-[#A8A49E]">
                    Ward range:
                  </span>
                  <span className=" text-[10.5px] font-medium text-[#6B6760]">
                    {stats.wardNumbers}
                  </span>
                </div>
              )}
            </CardShell>

            {/* Age histogram */}
            <CardShell
              title="Age Profile"
              desc="Years — all registered animals"
              delay=".70s"
            >
              <ResponsiveContainer width="100%" height={140}>
                <BarChart
                  data={stats.ageBuckets}
                  margin={{ top: 16, right: 0, bottom: 0, left: -20 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid
                    vertical={false}
                    stroke={C.track}
                    strokeDasharray="4 4"
                  />
                  <XAxis
                    dataKey="range"
                    tick={{ fontSize: 10, fill: C.t3 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: C.t3 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(0,0,0,.03)" }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Animals">
                    {stats.ageBuckets.map((_, i) => (
                      <Cell
                        key={i}
                        fill={`hsl(${140 + i * 8}, ${40 - i * 3}%, ${55 - i * 5}%)`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 flex justify-between text-[10.5px] text-[#A8A49E] pt-3.5 border-t border-[#E8E4DC]">
                <span>
                  Youngest: <b className="text-[#6B6760] ">{stats.minAge}y</b>
                </span>
                <span>
                  Avg: <b className="text-[#6B6760] ">{stats.avgAge}y</b>
                </span>
                <span>
                  Oldest: <b className="text-[#6B6760] ">{stats.maxAge}y</b>
                </span>
              </div>
            </CardShell>

            {/* Vaccination ratio */}
            <CardShell
              title="Vaccination Ratio"
              desc="Coverage split by status"
              delay=".76s"
              className="md:col-span-2 xl:col-span-1"
            >
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {[
                  {
                    label: "Vaccinated",
                    value: stats.vaccinated,
                    gradFrom: "#3A6148",
                    gradTo: C.sage,
                  },
                  {
                    label: "Unvaccinated",
                    value: stats.unvaccinated,
                    gradFrom: "#8A3E3B",
                    gradTo: C.rose,
                  },
                ].map(({ label, value, gradFrom, gradTo }) => (
                  <div
                    key={label}
                    className="rounded-[10px] px-3.5 pt-3.5 pb-4 flex flex-col justify-end relative overflow-hidden min-h-22.5"
                    style={{
                      background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
                    }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,.15), transparent)",
                      }}
                    />
                    <div className="relative z-10">
                      <div className=" text-[30px] font-bold text-white leading-none">
                        {value}
                      </div>
                      <div className="text-[9.5px] text-white/65 mt-0.5 tracking-[.06em] uppercase font-medium">
                        {label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-9 rounded-lg overflow-hidden flex">
                <div
                  className="flex items-center justify-center text-[10.5px] font-bold tracking-[.04em] text-white/90"
                  style={{
                    flex: stats.vaccinated,
                    background: `linear-gradient(90deg, ${C.sage}, ${C.sageMid})`,
                  }}
                >
                  {stats.vaccinationPct}%
                </div>
                {stats.unvaccinated > 0 && (
                  <div
                    className="flex items-center justify-center text-[10.5px] font-bold text-white/90"
                    style={{ flex: stats.unvaccinated, background: C.rose }}
                  >
                    {100 - stats.vaccinationPct}%
                  </div>
                )}
              </div>
              <div className="mt-3 text-[10.5px] text-[#A8A49E]">
                Above district threshold of{" "}
                <span className=" font-semibold text-[#4A7C59]">75%</span>
              </div>
            </CardShell>
          </div>

          {/* ── Registration Timeline ────────────────────────────── */}
          <CardShell
            title="Registration Timeline"
            desc={`Monthly cumulative registrations`}
            badge={{
              label: `${stats.timelineData.length} month${stats.timelineData.length !== 1 ? "s" : ""}`,
              variant: "amber",
            }}
            delay=".82s"
          >
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={stats.timelineData}
                margin={{ top: 10, right: 20, bottom: 0, left: -20 }}
              >
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.sage} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={C.sage} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke={C.track}
                  strokeDasharray="6 5"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 9, fill: C.t3 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: C.t3 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  domain={[0, "dataMax + 1"]}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: C.sage,
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke={C.sage}
                  strokeWidth={2.5}
                  fill="url(#areaGrad)"
                  dot={{ r: 4, fill: "#fff", stroke: C.sage, strokeWidth: 2 }}
                  activeDot={{
                    r: 5,
                    fill: C.sage,
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                  name="Cumulative"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardShell>
        </div>
      </div>
    </>
  );
}
