import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export default function EmptyState({ icon: Icon, title, children, action }: { icon: LucideIcon; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-box border border-dashed border-base-content/25 px-6 py-14 text-center">
      <Icon className="mx-auto size-9 text-base-content/50" />
      <h2 className="mt-3 text-lg font-semibold">{title}</h2>
      {children && <p className="mx-auto mt-1 max-w-md text-sm text-base-content/70">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
