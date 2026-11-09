import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type ActionLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "light" | "outline";
  className?: string;
  ariaLabel?: string;
} & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "className" | "children"
>;

const variants = {
  primary:
    "border border-emerald-950 bg-emerald-950 text-white hover:bg-emerald-900",
  light:
    "border border-emerald-900 bg-white text-emerald-950 hover:bg-emerald-50",
  outline:
    "border border-white/80 bg-transparent text-white hover:bg-white/10",
};

export function ActionLink({
  href,
  children,
  variant = "primary",
  className = "",
  ariaLabel,
  ...props
}: ActionLinkProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={[
        "inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-3",
        "text-sm font-bold no-underline shadow-sm transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500",
        variants[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </Link>
  );
}