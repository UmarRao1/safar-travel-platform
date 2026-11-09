export type ItineraryDay = {
  day: number;
  title: string;
  description: string;
  overnight?: string;
};

export function ItineraryTimeline({ days }: { days: ItineraryDay[] }) {
  if (days.length === 0) {
    return <div className="card border-dashed p-6 text-sm text-muted">A day-by-day itinerary will be prepared with your travel quotation.</div>;
  }
  return (
    <ol>
      {days.map((item, index) => (
        <li key={`${item.day}-${item.title}`} className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 pb-6 last:pb-0">
          <div className="relative flex justify-center">
            {index !== days.length - 1 && <span className="absolute bottom-[-1.5rem] top-10 w-px bg-line" aria-hidden="true" />}
            <span className="z-10 grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-sm font-semibold text-accent">{item.day}</span>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
            {item.overnight && <p className="mt-3 text-sm text-muted">Overnight: <span className="font-medium text-ink">{item.overnight}</span></p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
