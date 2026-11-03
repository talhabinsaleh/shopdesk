"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal({ open, title, children, confirmLabel, busy, onConfirm, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="modal" onClose={onClose}>
      <div className="modal-box border border-base-300">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="mt-3 leading-relaxed text-base-content/75">{children}</div>
        <div className="modal-action">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="button" className="btn btn-error btn-sm" onClick={onConfirm} disabled={busy}>
            {busy && <span className="loading loading-spinner loading-xs" />} {confirmLabel}
          </button>
        </div>
      </div>
      <button type="button" className="modal-backdrop" aria-label="Close dialog" onClick={onClose} />
    </dialog>
  );
}
