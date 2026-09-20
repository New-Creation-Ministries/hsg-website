import { useEffect, useState } from "react";

/**
 * A component with props worth capturing — this is what phase 04's fiber walk
 * will be pointed at, and what a pin gets anchored to by hand.
 *
 * Rows arrive asynchronously on purpose. A real app paints an empty shell and
 * fills it when an API answers, which is exactly the case that used to make
 * pins orphan themselves on reload.
 */
const VISITS = [
  { id: 91, provider: "Dr. Okafor", reason: "Follow-up", last_visit_at: "2026-07-30" },
  { id: 92, provider: "Dr. Lindqvist", reason: "Annual", last_visit_at: "2026-06-14" },
];

/** Milliseconds before the fake fetch resolves. */
const FAKE_LATENCY_MS = 600;

export function VisitRow({ visit }) {
  return (
    <li data-testid={`visit-${visit.id}`} style={{ padding: "8px 0" }}>
      <strong>{visit.provider}</strong> — {visit.reason}
    </li>
  );
}

export function VisitList() {
  const [visits, setVisits] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisits(VISITS), FAKE_LATENCY_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!visits) return <p data-testid="visit-loading">Loading visits…</p>;

  return (
    <ul data-testid="visit-list" style={{ listStyle: "none", padding: 0 }}>
      {visits.map((visit) => (
        <VisitRow key={visit.id} visit={visit} />
      ))}
    </ul>
  );
}
