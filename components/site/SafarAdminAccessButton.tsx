import Link from "next/link";

export default function SafarAdminAccessButton() {
  return (
    <Link
      href="/admin/login"
      aria-label="Open Safar admin sign-in"
      title="Admin sign in"
      className="fixed bottom-5 right-5 z-[100] inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#203e30] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#315e49] focus:outline-none focus:ring-4 focus:ring-[#315e49]/30"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 5 6v5c0 4.5 2.9 8 7 10 4.1-2 7-5.5 7-10V6l-7-3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12 11 13.5l3.5-3.5" />
      </svg>
      Admin
    </Link>
  );
}
