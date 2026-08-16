import React from "react";

/* ================================================================== */
/* Cabecera de sección — jerarquía editorial uniforme y simétrica.     */
/* meta (categoría) + título serif + descripción opcional + acción.    */
/* ================================================================== */

export default function SectionHeader({
  meta,
  title,
  description,
  action,
}: {
  meta: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-2xl space-y-2">
        <p className="rdm-meta" style={{ color: "var(--rdm-petroleum)" }}>
          {meta}
        </p>
        <h2 className="rdm-display-md font-display text-[#10243d]">{title}</h2>
        {description && (
          <p className="text-sm leading-relaxed text-[#475569]">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}