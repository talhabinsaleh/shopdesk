"use client";

import { useState } from "react";
import { formatDay, money } from "@/lib/format";
import type { DayPoint } from "@/lib/types";

// Rounds the top of the scale up to a tidy figure such as 40,000
function niceMax(value: number) {
  if (value <= 0) return 1000;
  const size = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((option) => option * size >= value) ?? 10;
  return step * size;
}

const short = (value: number) => (value >= 1000 ? `৳${Math.round(value / 100) / 10}k` : `৳${value}`);

// One series, so the title names it and no legend is needed. Each column is a full-height hover target.
export default function SalesChart({ days, title }: { days: DayPoint[]; title: string }) {
  const [active, setActive] = useState<number | null>(null);
  const top = niceMax(Math.max(...days.map((day) => day.sales), 0));
  const labelEvery = Math.ceil(days.length / 6);
  const hovered = active === null ? null : days[active];

  return (
    <figure className="rounded-box border border-base-300 bg-base-100 p-4">
      <figcaption className="font-semibold">{title}</figcaption>
      <div className="mt-4 flex gap-2">
        <div className="figure relative h-52 w-12 shrink-0 text-right text-[11px] text-base-content/60" aria-hidden="true">
          {[1, 0.5, 0].map((share) => (
            <span key={share} className="absolute right-0 -translate-y-1/2" style={{ top: `${(1 - share) * 100}%` }}>{short(top * share)}</span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          <div className="absolute inset-x-0 top-0 h-52" aria-hidden="true">
            {[0, 50].map((at) => <div key={at} className="absolute inset-x-0 border-t border-base-300" style={{ top: `${at}%` }} />)}
            <div className="absolute inset-x-0 bottom-0 border-t border-base-content/40" />
          </div>
          <div className="relative flex h-52 items-end gap-[2px]" onPointerLeave={() => setActive(null)}>
            {days.map((day, index) => (
              <button
                key={day.day}
                type="button"
                className="flex h-full min-w-0 flex-1 cursor-default items-end justify-center focus-visible:outline-2 focus-visible:outline-primary"
                aria-label={`${formatDay(day.day)}: ${money(day.sales)}, ${day.orders} orders`}
                onPointerEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
              >
                <span
                  className={`block w-full max-w-5 rounded-t transition-opacity ${active !== null && active !== index ? "opacity-50" : ""}`}
                  style={{ height: day.sales ? `max(2px, ${(day.sales / top) * 100}%)` : 0, background: "var(--color-primary)" }}
                />
              </button>
            ))}
          </div>
          {hovered && active !== null && (
            <div
              className="pointer-events-none absolute top-1 z-10 w-max rounded-field border border-base-300 bg-base-200 px-2.5 py-1.5 text-xs shadow-lg"
              style={active > days.length / 2 ? { right: `${((days.length - active) / days.length) * 100}%` } : { left: `${((active + 1) / days.length) * 100}%` }}
            >
              <p className="font-medium">{formatDay(hovered.day)}</p>
              <p className="figure">{money(hovered.sales)}</p>
              <p className="text-base-content/70">{hovered.orders} {hovered.orders === 1 ? "order" : "orders"}</p>
            </div>
          )}
          <div className="mt-2 flex gap-[2px] text-[11px] text-base-content/60" aria-hidden="true">
            {days.map((day, index) => (
              <span key={day.day} className="relative h-4 min-w-0 flex-1">
                {index % labelEvery === 0 && <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap">{formatDay(day.day)}</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}
