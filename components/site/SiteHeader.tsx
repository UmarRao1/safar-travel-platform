"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Check, Menu, Moon, Palette, Sun, X } from "lucide-react";
import { useSafarTheme, type AccentColor } from "@/components/ThemeProvider";

const navigation = [
  { label: "Destinations", href: "/destinations" },
  { label: "International", href: "/international" },
  { label: "Hajj & Umrah", href: "/hajj-umrah" },
  { label: "AI planner", href: "/plan-trip" },
  { label: "Experiences", href: "/travel-experience-demo" },
];

const accents: { id: AccentColor; label: string; color: string }[] = [
  { id: "green", label: "Forest", color: "#176b4a" },
  { id: "blue", label: "Ocean", color: "#1764a0" },
  { id: "violet", label: "Violet", color: "#7545b8" },
  { id: "amber", label: "Sunset", color: "#a65b12" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { theme, accent, toggleTheme, setAccent } = useSafarTheme();
  const [open, setOpen] = useState(false);
  const dark = theme === "dark";

  const linkClass = (href: string) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      pathname === href || pathname.startsWith(`${href}/`) ? "bg-accent-soft text-accent" : "text-muted hover:text-ink"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Safar home" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-sm font-bold text-white">S</span>
          <span className="text-lg font-semibold tracking-tight">Safar</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.href)}>{item.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <details className="group relative">
            <summary
              aria-label="Appearance"
              className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-lg border border-line text-muted transition hover:text-ink [&::-webkit-details-marker]:hidden"
            >
              <Palette size={16} />
            </summary>
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-line bg-surface p-2 shadow-[var(--shadow)]">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-surface-2"
              >
                {dark ? <Sun size={15} /> : <Moon size={15} />}
                {dark ? "Light mode" : "Dark mode"}
              </button>
              <div className="my-1 border-t border-line" />
              {accents.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAccent(a.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-surface-2"
                >
                  <span className="h-3.5 w-3.5 rounded-full" style={{ background: a.color }} />
                  {a.label}
                  {accent === a.id && <Check size={14} className="ml-auto text-accent" />}
                </button>
              ))}
            </div>
          </details>
          <Link href="/admin" className="btn btn-secondary btn-sm hidden sm:inline-flex">Admin</Link>
          <Link href="/booking" className="btn btn-primary btn-sm hidden sm:inline-flex">Request a quote</Link>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Mobile" className="border-t border-line bg-surface lg:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={linkClass(item.href)}>
                {item.label}
              </Link>
            ))}
            <Link href="/admin" onClick={() => setOpen(false)} className={linkClass("/admin")}>Admin</Link>
            <Link href="/booking" onClick={() => setOpen(false)} className="btn btn-primary mt-2">Request a quote</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
