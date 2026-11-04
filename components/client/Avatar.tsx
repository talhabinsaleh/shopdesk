"use client";

import { useState } from "react";
import { initials } from "@/lib/shared/format";

export default function Avatar({ name, src, className = "size-10 text-sm" }: { name?: string | null; src?: string | null; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return <img src={src} alt={name ?? "User"} referrerPolicy="no-referrer" onError={() => setFailed(true)} className={`${className} shrink-0 rounded-full object-cover`} />;
  }
  return (
    <span className={`${className} grid shrink-0 place-items-center rounded-full bg-primary font-semibold text-primary-content`} aria-label={name ?? "User"}>
      {initials(name)}
    </span>
  );
}
