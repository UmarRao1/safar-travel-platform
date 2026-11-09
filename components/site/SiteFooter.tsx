import Link from "next/link";

const links = [
  { label: "Destinations", href: "/destinations" },
  { label: "International", href: "/international" },
  { label: "Hajj & Umrah", href: "/hajj-umrah" },
  { label: "AI trip planner", href: "/plan-trip" },
  { label: "Request a quote", href: "/booking" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-page flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <p className="text-lg font-semibold tracking-tight">Safar</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Travel across Pakistan and beyond, planned with clear quotes and personal service.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm text-muted">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink">{l.label}</Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="container-page py-5 text-xs text-muted">© 2026 Safar Travel. Plans and prices are estimates until confirmed.</p>
      </div>
    </footer>
  );
}
