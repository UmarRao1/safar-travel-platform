"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ExternalLink, Loader2, LogOut, Search } from "lucide-react";
import { Photo } from "@/components/ui/Photo";

type Status = "PENDING" | "QUOTED" | "CONFIRMED" | "CANCELLED";
type Booking = {
  id: string; customerName: string; email: string; phone: string; travelers: number;
  startDate: string | null; specialRequests: string | null; status: Status;
  quotedPrice: string | null; currency: string; adminNotes: string | null; createdAt: string;
  packageTitle: string | null; destinationName: string | null; photo: string | null;
};
type Draft = { status: Status; quotedPrice: string; currency: string; adminNotes: string };

const statuses: Status[] = ["PENDING", "QUOTED", "CONFIRMED", "CANCELLED"];
const currencies = ["PKR", "USD", "SAR", "GBP", "EUR"] as const;
const tone: Record<Status, { dot: string; badge: string; label: string }> = {
  PENDING: { dot: "bg-amber-500", badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300", label: "Pending" },
  QUOTED: { dot: "bg-blue-500", badge: "bg-blue-500/15 text-blue-700 dark:text-blue-300", label: "Quoted" },
  CONFIRMED: { dot: "bg-green-600", badge: "bg-green-600/15 text-green-700 dark:text-green-300", label: "Confirmed" },
  CANCELLED: { dot: "bg-red-500", badge: "bg-red-500/15 text-red-700 dark:text-red-300", label: "Cancelled" },
};

const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

export default function AdminBookings({ bookings }: { bookings: Booking[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"ALL" | Status>("ALL");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState<{ id: string; text: string; error: boolean } | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: bookings.length };
    for (const s of statuses) c[s] = bookings.filter((b) => b.status === s).length;
    return c;
  }, [bookings]);

  const getDraft = (b: Booking): Draft =>
    drafts[b.id] ?? { status: b.status, quotedPrice: b.quotedPrice ?? "", currency: b.currency || "PKR", adminNotes: b.adminNotes ?? "" };
  const setDraft = (b: Booking, patch: Partial<Draft>) => setDrafts((old) => ({ ...old, [b.id]: { ...getDraft(b), ...patch } }));

  const rows = bookings.filter((b) => {
    if (filter !== "ALL" && b.status !== filter) return false;
    const hay = [b.customerName, b.email, b.phone, b.packageTitle ?? "", b.destinationName ?? "", b.id].join(" ").toLowerCase();
    return hay.includes(search.toLowerCase());
  });

  async function save(b: Booking) {
    const d = getDraft(b);
    setBusyId(b.id); setMessage(null);
    try {
      const res = await fetch(`/api/admin/bookings/${encodeURIComponent(b.id)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...d, quotedPrice: d.quotedPrice.trim() === "" ? null : d.quotedPrice }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Could not save this booking.");
      setMessage({ id: b.id, text: "Booking updated.", error: false });
      router.refresh();
    } catch (error) {
      setMessage({ id: b.id, text: error instanceof Error ? error.message : "Could not save this booking.", error: true });
    } finally { setBusyId(""); }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const stats = [
    { label: "Total requests", value: counts.ALL, dot: "bg-ink" },
    ...statuses.map((s) => ({ label: tone[s].label, value: counts[s], dot: tone[s].dot })),
  ];

  return (
    <div className="min-h-svh bg-bg">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4" style={{ width: "min(100% - 2.5rem, 80rem)" }}>
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5" aria-label="Safar home">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-sm font-bold text-white">S</span>
              <span className="font-semibold tracking-tight">Safar</span>
            </Link>
            <span className="h-5 w-px bg-line" />
            <span className="text-sm text-muted">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="btn btn-secondary btn-sm"><ExternalLink size={14} /> View site</Link>
            <button onClick={logout} className="btn btn-secondary btn-sm"><LogOut size={14} /> Sign out</button>
          </div>
        </div>
      </header>

      <main className="container-page py-8" style={{ width: "min(100% - 2.5rem, 80rem)" }}>
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Booking requests</h1>
          <p className="mt-1 text-sm text-muted">Review enquiries, prepare quotations and update status. Notes are internal.</p>
        </div>

        <section aria-label="Summary" className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          {stats.map((item) => (
            <div key={item.label} className="card p-4">
              <p className="flex items-center gap-2 text-sm text-muted"><span className={`h-2 w-2 rounded-full ${item.dot}`} /> {item.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="card mt-6 overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter by status">
              {(["ALL", ...statuses] as const).map((s) => (
                <button key={s} role="tab" aria-selected={filter === s} onClick={() => setFilter(s)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${filter === s ? "bg-accent text-white" : "text-muted hover:bg-surface-2 hover:text-ink"}`}>
                  {s === "ALL" ? "All" : tone[s].label} <span className="opacity-70">{counts[s]}</span>
                </button>
              ))}
            </div>
            <div className="relative lg:w-80">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search bookings"
                placeholder="Search name, phone, destination…" className="field pl-9" />
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="p-12 text-center">
              <h2 className="font-semibold">No bookings found</h2>
              <p className="mt-1 text-sm text-muted">Try another search or status filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[56rem] text-left text-sm">
                <thead className="border-b border-line bg-surface-2/60 text-xs text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Destination</th>
                    <th className="px-4 py-3 font-medium">Travellers</th>
                    <th className="px-4 py-3 font-medium">Travel date</th>
                    <th className="px-4 py-3 font-medium">Quote</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="w-10 px-2 py-3"><span className="sr-only">Details</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((b) => {
                    const open = openId === b.id;
                    const d = getDraft(b);
                    return (
                      <Fragment key={b.id}>
                        <tr onClick={() => setOpenId(open ? null : b.id)} className="cursor-pointer transition hover:bg-surface-2/60">
                          <td className="px-4 py-3">
                            <p className="font-medium">{b.customerName}</p>
                            <p className="text-xs text-muted">{b.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Photo src={b.photo} alt={b.destinationName ?? "No destination"} className="h-10 w-10 shrink-0 rounded-lg" />
                              <div className="min-w-0">
                                <p className="truncate font-medium">{b.destinationName ?? "Custom enquiry"}</p>
                                <p className="truncate text-xs text-muted">{b.packageTitle ?? "No package selected"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">{b.travelers}</td>
                          <td className="px-4 py-3 text-muted">{date(b.startDate)}</td>
                          <td className="px-4 py-3">{b.quotedPrice ? `${b.currency} ${Number(b.quotedPrice).toLocaleString("en-US")}` : <span className="text-muted">—</span>}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tone[b.status].badge}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${tone[b.status].dot}`} /> {tone[b.status].label}
                            </span>
                          </td>
                          <td className="px-2 py-3">
                            <button aria-expanded={open} aria-label={`${open ? "Hide" : "Show"} details for ${b.customerName}`}
                              className="grid h-8 w-8 place-items-center rounded-md text-muted hover:text-ink"
                              onClick={(e) => { e.stopPropagation(); setOpenId(open ? null : b.id); }}>
                              <ChevronDown size={16} className={`transition ${open ? "rotate-180" : ""}`} />
                            </button>
                          </td>
                        </tr>

                        {open && (
                          <tr className="bg-surface-2/40">
                            <td colSpan={7} className="px-4 py-6">
                              <div className="grid gap-8 lg:grid-cols-2">
                                <div>
                                  <h3 className="text-sm font-semibold">Request details</h3>
                                  <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                    {[
                                      ["Email", b.email], ["Phone", b.phone],
                                      ["Submitted", new Date(b.createdAt).toLocaleString("en-GB")],
                                      ["Reference", b.id],
                                    ].map(([k, v]) => (
                                      <div key={k} className="min-w-0"><dt className="text-xs text-muted">{k}</dt><dd className="mt-0.5 break-all font-medium">{v}</dd></div>
                                    ))}
                                  </dl>
                                  {b.specialRequests && (
                                    <div className="mt-4 rounded-lg border border-line bg-surface p-3">
                                      <p className="text-xs text-muted">Special requests</p>
                                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{b.specialRequests}</p>
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <h3 className="text-sm font-semibold">Quote and internal notes</h3>
                                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                    <label><span className="label">Status</span>
                                      <select value={d.status} onChange={(e) => setDraft(b, { status: e.target.value as Status })} className="field">
                                        {statuses.map((s) => <option key={s} value={s}>{tone[s].label}</option>)}
                                      </select>
                                    </label>
                                    <label><span className="label">Quotation</span>
                                      <input type="number" min="0" step="0.01" value={d.quotedPrice} placeholder="125000"
                                        onChange={(e) => setDraft(b, { quotedPrice: e.target.value })} className="field" />
                                    </label>
                                    <label><span className="label">Currency</span>
                                      <select value={d.currency} onChange={(e) => setDraft(b, { currency: e.target.value })} className="field">
                                        {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
                                      </select>
                                    </label>
                                  </div>
                                  <label className="mt-3 block"><span className="label">Internal notes (not shown to customer)</span>
                                    <textarea rows={3} maxLength={4000} value={d.adminNotes} onChange={(e) => setDraft(b, { adminNotes: e.target.value })}
                                      placeholder="Supplier cost, availability check, follow-ups…" className="field" />
                                  </label>
                                  <div className="mt-4 flex items-center gap-4">
                                    <button onClick={() => save(b)} disabled={busyId === b.id} className="btn btn-primary btn-sm">
                                      {busyId === b.id ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Save changes"}
                                    </button>
                                    {message?.id === b.id && (
                                      <p role="status" className={`text-sm ${message.error ? "text-red-600" : "text-accent"}`}>{message.text}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
