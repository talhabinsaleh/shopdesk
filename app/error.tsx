"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="grid min-h-svh place-items-center px-4 text-center">
      <div>
        <h1 className="section-title">This page could not load.</h1>
        <p className="section-text mx-auto">Please try again in a moment.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={reset} className="btn btn-primary"><RotateCcw className="size-4" /> Try again</button>
          <Link href="/" className="btn btn-outline">Back to the shop</Link>
        </div>
      </div>
    </div>
  );
}
